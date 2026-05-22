import { Request, Response, NextFunction } from 'express';
import { upload } from '../config/storage.config';
import { sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';

export const uploadProductImages = (req: Request, res: Response, next: NextFunction): void => {
  req.uploadFolder = 'products';
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    next();
  });
};

export const uploadBespokeImages = (req: Request, res: Response, next: NextFunction): void => {
  req.uploadFolder = 'bespoke';
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    next();
  });
};

export const uploadSingleImage = (req: Request, res: Response, next: NextFunction): void => {
  req.uploadFolder = 'products';
  upload.single('image')(req, res, (err) => {
    if (err) {
      sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    next();
  });
};
