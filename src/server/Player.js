import { loginfo, logerror } from "./log.js";


export class Player {
  name;
  room;

  constructor(name = "player", room = "lobby") {
    this.name = name;
    this.room = room;
  }

  rename(new_name) {
    const ret = check_name(new_name);
    if (ret) {
      loginfo(`${this.name} renamed to ${new_name}`);
      this.name = new_name;
    } else {
      logerror(`${new_name} is not a valid name`);
    }
    return ret;
  }
}

const check_name = (name) => {
  let code, index;
  const len = name.length;
  if (len < 1) {
    return false;
  }
  for (index = 0; index < len; index++) {
    code = name.charCodeAt(index);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) // lower alpha (a-z)
    ) {
      return false;
    }
  }
  return true;
};
