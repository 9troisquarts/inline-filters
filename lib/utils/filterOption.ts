import { OptionType } from "../types";

const filterOption = (input: string, option: OptionType) =>
  option.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .indexOf(
      input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
    ) >= 0;

export default filterOption;
