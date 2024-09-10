import IFilters, { configure } from "./InlineFilters";

const InlineFilters = IFilters;
// @ts-ignore
InlineFilters.configure = configure;

export default InlineFilters;
