enum LogLevelEnum {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export { LogLevelEnum };

export function getLogLevelName(level: LogLevelEnum): string {
  switch (level) {
    case LogLevelEnum.DEBUG:
      return 'DEBUG';
    case LogLevelEnum.INFO:
      return 'INFO';
    case LogLevelEnum.WARNING:
      return 'WARNING';
    case LogLevelEnum.ERROR:
      return 'ERROR';
    case LogLevelEnum.CRITICAL:
      return 'CRITICAL';
    default:
      return 'UNKNOWN';
  }
}
