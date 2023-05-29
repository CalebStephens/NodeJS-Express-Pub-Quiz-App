import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";

const role = ["SUPER_ADMIN_USER"];

const seedBasicUsers = async (req, res) => {
    try {
      const { id } = req.user
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });

      if(user.role != role){
        return res.status(403).json({
          msg: "Not authorized to access this route",
        });
      }

      const data = await axios.get("https://gist.githubusercontent.com/CalebStephens/227847a99599ea21855d0488123b0cb1/raw/a62f54fbb050295efc719144d45c23cf66df8a66/basicUsers.json");

      await prisma.user.createMany({data: data.data})
      return res.status(201).json({msg: "Basic users successfully created"})
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  
export {
    prisma,
    seedBasicUsers,
  };
