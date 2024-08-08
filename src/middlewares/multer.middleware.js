import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      // we add uniqueSuffix so that we dont end up overwitting files with same name
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) 

     // cb(null, file.fieldname + '-' + uniqueSuffix)
     cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ storage })   