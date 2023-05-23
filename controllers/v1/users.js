import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const roles = ["ADMIN_USER", "SUPER_ADMIN_USER"];

const getUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if(req.user.id != req.params.id){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
  
      /**
       * The findUnique function returns a single record using
       * an id or unique identifier
       */
      // const record = await model.findUnique({where: { id: Number(id) }});
      
      if (!user) {
        return res
          .status(200)
          .json({ msg: `No User with the id: ${id} found` });
      }
  
      return res.json({ data: user });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const getRecords = async (req, res, model, modelName, include) => {
    try {
      const { id } = req.params;
  
      /**
       * The findUnique function returns a single record using
       * an id or unique identifier
       */
      const records = include ? await model.findMany({include}) : await model.findMany();
      
      if (!records) {
        return res
          .status(200)
          .json({ msg: `No ${modelName}'s found` });
      }
  
      return res.json({ data: records });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };
  const createRecord = async (req, res, model, modelName, include) => {
    try {
      /**
       * Get the authenticated user's id from the Request's user property
       */
      const { id } = req.user;
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      // console.log(id)

      if ((user.role !== "ADMIN_USER") || (user.role !== "SUPER_ADMIN_USER")) {
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }

      console.log({data:{...req.body, userId: id }})
  
      /**
       * Now you will know which authenticated user created the record
       */
      await model.create({
        data:{...req.body, userId: id },
    
        });
  
      const newRecords = await model.findMany({include});
  
      return res.status(201).json({
        msg: `${modelName} successfully created`,
        data: newRecords,
      });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const updateRecord = async (req, res, model) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
      console.log(user)
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          msg: "Not authorized to access this route",
          
        });
      }

      const { ...data } = req.body;
  
      let record = await model.findUnique({
        where: { id: Number(id) },
      });
  
      if (!record) {
        return res.status(200).json({ msg: `No record with the id: ${id} found` });
      }
  
      record = await model.update({
        where: { id: Number(id) },
        data,
      });
  
      return res.json({
        msg: `Record with the id: ${id} successfully updated`,
        data: record,
      });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const deleteRecord = async (req, res, model) => {
    try {
      const { id } = req.params;
  
      const record = await model.findUnique({
        where: { id: Number(id) },
      });
  
      if (!record) {
        return res
          .status(200)
          .json({ msg: `No record with the id: ${id} found` });
      }
  
      await model.delete({
        where: { id: Number(id) },
      });
  
      return res.json({
        msg: `Record with the id: ${id} successfully deleted`,
      });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };
  

export {
    prisma,
    getUser,
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord
  };
