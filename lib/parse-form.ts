import type { NextApiRequest } from "next";
import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import formidable, { errors as formidableErrors } from "formidable";
import { mkdir, stat } from "fs/promises";

formidableErrors;

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      maxFiles: 5,
      maxFileSize: 100 * 1024 * 1024, // 1mb
      uploadDir,
      filename: (_name:any, _ext:any, part:any) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      },
      filter: (part:any) => {
        return (
         part.mimetype?.includes("pdf") || false
        );
      },
    });

    form.parse(req, function (err:unknown, fields:unknown, files:unknown) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export {
  formidableErrors,
  parseForm
}