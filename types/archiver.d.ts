declare module "archiver" {
  import { Transform } from "stream";

  export class Archiver extends Transform {
    directory(dirpath: string, destpath: string | false): this;
    finalize(): Promise<void>;
  }

  export class ZipArchive extends Archiver {
    constructor(options?: { zlib?: { level?: number } });
  }

  export class TarArchive extends Archiver {
    constructor(options?: Record<string, unknown>);
  }
}
