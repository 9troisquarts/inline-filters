import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

dayjs().format('L LT LLL');

export default dayjs;
