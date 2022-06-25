import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const submissionMulterConfig = {
  storage: diskStorage({
    destination: './media/user-photo',
    filename: (req, file, cb) => {
      cb(null, uuidv4() + '-' + file.originalname.replace(/ /g, '-'));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new BadRequestException('file types must be jpg, png or jpeg'), false);
    }
  },
  limits: { fileSize: 100000000 },
};
