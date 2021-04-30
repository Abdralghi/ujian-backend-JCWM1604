const { mysqldb } = require("./../connection");
const { createAccessToken } = require("./../helpers/CreateToken");
const { promisify } = require("util");
const { threadId } = require("../connection/mysqldb");
const dba = promisify(mysqldb.query).bind(mysqldb);

module.exports = {
  register: async (req, res) => {
    try {
      const { email, username, password } = req.body;
      let numbers = /[0-9]/g;
      let capital = /[a-z]/g;
      let special = /[.*+!?^${}()|[\]\\]/g;
      let at = /[@]/g;
      if (!email || !username || !password)
        throw { message: "input harus diisi semua" };
      if (username.length < 6) throw { message: "username minimal 6 huruf" };
      if (password.length < 6)
        throw { message: "password harus lebih dari 6 karakter" };
      if (!email.match(at))
        throw { message: "pastikan input email dalam bentuk email" };
      if (!password.match(capital)) throw { message: "harus kombinasi huruf" };
      if (!password.match(numbers)) throw { message: "harus mengandung angka" };
      if (!password.match(special))
        throw { message: "harus mengandung spesial karakter" };
      let sql = `select * from users where username = ?`;
      const user = await dba(sql, [username, email]);
      if (user.length) {
        return res.status(500).send({ message: "username sudah terpakai" });
      }
      sql = `insert users set ?`;
      const data = {
        uid: Date.now(),
        username: username,
        password: password,
        email: email,
      };
      await dba(sql, [data]);
      sql = `select id,uid,username,email from users where uid = ?`;
      const iduser = data.uid;
      const datauser = await dba(sql, [iduser]);
      let dataToken = {
        uid: datauser[0].uid,
        role: datauser[0].role,
      };
      const tokenAccess = createAccessToken(dataToken);
      res.set("x-token-access", tokenAccess);
      res.status(200).send({ ...datauser[0], token: tokenAccess });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  },
  login: async (req, res) => {
    try {
      const { user, password } = req.body;
      if (!user || !password) throw { message: "password atau username salah" };
      let sql = `select id,uid,username,email,password,role,status from users where (username = ? or email = ?) and password = ?`;
      const datauser = await dba(sql, [user, user, password]);
      if (datauser.length == 0) throw { message: "user tidak terdaftar" };
      if (datauser[0].status !== 1)
        return res
          .status(500)
          .send({ message: "user sudah dihapus atau sedang deactive" });
      if (datauser[0].password !== password)
        return res.status(500).send({ message: "password salah" });
      if (datauser.length) {
        const datatoken = {
          uid: datauser[0].uid,
          role: datauser[0].role,
        };
        const token = createAccessToken(datatoken);
        sql = `select id,uid,username,email,role,status from users where username = ?`;
        const datasend = await dba(sql, [user]);
        res.set("x-token-access", token);
        return res.status(200).send({ ...datasend[0], token: token });
      }
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  },
  // akses dengan token
  deactive: async (req, res) => {
    try {
      let sql = `select * from users where uid = ${req.user.uid}`;
      const data = await dba(sql);
      if (data[0].status !== 1)
        return res.status(500).send({
          message: "hanya akun dengan status active yang bisa di non-aktifkan",
        });
      sql = `update users set status = 2 where uid = ${req.user.uid}`;
      await dba(sql);
      sql = `select u.uid,s.status from users u 
      join status s on u.status = s.id where uid = ${req.user.uid}`;
      const datauser = await dba(sql);
      return res.status(200).send(datauser);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  activate: async (req, res) => {
    try {
      let sql = `select * from users where uid = ${req.user.uid}`;
      const data = await dba(sql);
      if (data[0].status !== 2)
        return res.status(500).send({
          message:
            "hanya akun dengan status deactive yang bisa di aktifkan kembali",
        });
      sql = `update users set status = 1 where uid = ${req.user.uid}`;
      await dba(sql);
      sql = `select u.uid,s.status from users u 
      join status s on u.status = s.id where uid = ${req.user.uid}`;
      const datauser = await dba(sql);
      return res.status(200).send(datauser);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  closeAccount: async (req, res) => {
    try {
      let sql = `select * from users where uid = ${req.user.uid}`;
      const data = await dba(sql);
      if (data[0].status == 3)
        return res.status(500).send({
          message:
            "pastikan user yang ingin dihapus adalah user dengan status active / deactive",
        });
      sql = `update users set status = 3 where uid = ${req.user.uid}`;
      await dba(sql);
      sql = `select u.uid,s.status from users u 
      join status s on u.status = s.id where uid = ${req.user.uid}`;
      const datauser = await dba(sql);
      return res.status(200).send(datauser);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
