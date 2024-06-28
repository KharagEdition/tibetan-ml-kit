import Server from "ws";
import { ModelConfig } from "./common/model-config";

declare module "tibetan-ml-kit" {
  export class TibetanMlKit {
    constructor(server: Server, modelConfig: ModelConfig);
  }
}
