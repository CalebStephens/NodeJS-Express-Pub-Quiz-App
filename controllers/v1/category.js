import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";

const getCategories = async (req,res) => {
    try{
        const records = await prisma.category.findMany()

        return res.status(200).json({data: records})
    }catch{
        return res.status(500).json({
            msg: err.message,
        });
    }
}

const createCategories = async (req,res) => {
    try{
        // const { id } = req.user
        // const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  
        // if(user.role != role){
        //   return res.status(403).json({
        //     msg: "Not authorized to access this route",
        //   });
        // }
        await prisma.category.deleteMany()
  
        const data = await axios.get("https://opentdb.com/api_category.php");
        console.log(data.data.trivia_categories)
        await prisma.category.createMany({data: data.data.trivia_categories})
        return res.status(201).json({msg: "Categories successfully created"})
      }catch(err){
        return res.status(500).json({
          msg: err.message,
        });
      }
    }


export {
    getCategories,
    createCategories,
  };