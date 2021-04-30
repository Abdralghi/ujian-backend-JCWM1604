const { mysqldb } = require("./../connection");
const { promisify } = require("util");
const dba = promisify(mysqldb.query).bind(mysqldb);

module.exports = {
  // user
  getAll: async (req, res) => {
    try {
      let sql = `select * from movies`;
      const datamovie = await dba(sql);
      return res.status(200).send(datamovie);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  getQuery: async (req, res) => {
    try {
      const { status, location, time } = req.query;
      let sql = `select m.*,ms.status,st.time,l.location from movies m join movie_status ms on m.status = ms.id
            join schedules s on m.id = s.movie_id 
            join show_times st on st.id = s.time_id
            join locations l on l.id = s.location_id where m.status > 0 `;
      if (status) {
        sql += `and ms.status = ${mysqldb.escape(status)} `;
      }
      if (location) {
        sql += `and l.location = ${mysqldb.escape(location)} `;
      }
      if (time) {
        sql += `and st.time = ${mysqldb.escape(time)}`;
      }
      const datamovie = await dba(sql);
      return res.status(200).send(datamovie);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  // admin
  addMovie: async (req, res) => {
    try {
      if (req.user.role !== 1)
        return res
          .status(500)
          .send({ message: "hanya admin yang boleh menambah daftar film" });
      const {
        name,
        genre,
        release_date,
        release_month,
        release_year,
        duration_min,
        description,
      } = req.body;
      let sql = `insert movies set ?`;
      const data = {
        name: name,
        genre: genre,
        release_date: release_date,
        release_month: release_month,
        release_year: release_year,
        duration_min: duration_min,
        description: description,
      };
      await dba(sql, [data]);
      sql = `select * from movies where name = ?`;
      const moviename = data.name;
      const datamovie = await dba(sql, [moviename]);
      return res.status(200).send(datamovie);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  changeStatus: async (req, res) => {
    try {
      if (req.user.role !== 1)
        return res
          .status(500)
          .send({ message: "hanya admin yang boleh mengubah status film" });
      const { id } = req.params;
      const { status } = req.body;
      if (status == 1) {
        return res
          .status(500)
          .send({ message: "ganti menjadi 2(on show) / 3(has shown)" });
      }
      let sql = `update movies set status = ? where id = ${id}`;
      const data = await dba(sql, [status, id]);
      console.log(data);
      return res
        .status(200)
        .send({ id: id, message: "status has been changed" });
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  addSchedule: async (req, res) => {
    try {
      if (req.user.role !== 1) {
        return res
          .status(500)
          .send({ message: "hanya admin yang boleh menambah schedule film" });
      } else {
        const { id } = req.params;
        const { location_id, time_id } = req.body;
        if (location_id <= 0 || time_id <= 0)
          return res.status(500).send({ message: "tidak boleh 0" });
        if (location_id > 3)
          return res
            .status(500)
            .send({ message: "pilih antara 1 - 3 untuk location" });
        if (time_id > 6)
          return res
            .status(500)
            .send({ message: "pilih antara 1 - 6 untuk time" });
        let sql = `insert schedules set movie_id = ${id}, location_id = ?, time_id = ?`;
        await dba(sql, [location_id, time_id]);
        return res
          .status(200)
          .send({ id: id, message: "schedule has been added" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};
