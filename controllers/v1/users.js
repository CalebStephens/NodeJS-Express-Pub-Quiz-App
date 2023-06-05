import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const role = "SUPER_ADMIN_USER";

const getUser = async (req, res) => {
    try {
        if(req.user.id != req.params.id){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
            
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

  const getUsers = async (req, res) => {
    try {
      
      const { id } = req.user
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      console.log(req.user)

      if(user.role != role){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
  
      /**
       * The findUnique function returns a single record using
       * an id or unique identifier
       */
      const records = await prisma.user.findMany()
      
      if (!records) {
        return res
          .status(200)
          .json({ msg: `No user's found` });
      }
  
      return res.json({ data: records });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  //.filter((record) => record.role == "BASIC_USER" )

  const updateUser = async (req, res) => {
    try {
      console.log(req)
      const { id } = req.params;      
      const { ...data } = req.body;
      
      let record = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      let user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });

      if (!record) {
        return res.status(200).json({ msg: `No record with the id: ${id} found` });
      }
      //allow basicand superadmin user to update their own stuff, or super admin update all basic users and not other superadmin
      if((user.id != record.id && user.role != role )|| user.role != role ){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
      
      if(req.body.hasOwnProperty('role') ){
        return res.status(403).json({
          msg: "Cannot change your role",
        });
      }

      record = await prisma.user.update({
        where: { id: Number(id) },
        data,
      });
  
      return res.json({
        msg: `${record.username} has been successfully updated`,
        data: record,
      });
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });

      if(user.role != role){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
      
      const { id } = req.params;
      const record = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
  
      if (!record) {
        return res
          .status(200)
          .json({ msg: `No record with the id: ${id} found` });
      }

      if(record.role == role && user.id != record.id ){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }
  
      await prisma.user.delete({
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
    getUsers,
    updateUser,
    deleteUser
  };
