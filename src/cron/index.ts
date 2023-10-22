import { CronSyntaxKind, CronFieldKind } from "./types";
import { oneOf } from "./parse/pattern";
import { CronFieldBuilder } from "./parse/CronField";
import { CronSyntaxBuilder } from "./parse/CronSyntax";

const MONTH_VARIANT_VALUE_MAP = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const DAY_OF_WEEK_VARIANT_VALUE_MAP = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export const CRON_SYNTAX = {
  [CronSyntaxKind.UNIX]: new CronSyntaxBuilder(
    CronSyntaxKind.UNIX,
    "Unix/Linux specification.",
  )
    .setDefault("0 12 * * FRI")
    .addField(
      new CronFieldBuilder(
        CronFieldKind.MINUTE,
        /[0-5]?\d/,
      ).addVariantDescription("0-59", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.HOUR,
        oneOf(/[01]?\d/, /2[0-3]/),
      ).addVariantDescription("0-23", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.DAY_OF_MONTH,
        oneOf(/[0-2]?\d/, /3[01]/),
      ).addVariantDescription("1-31", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.MONTH,
        oneOf(
          /[1-9]/,
          /1[012]/,
          /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/,
        ),
      )
        .setVariantValueMap(MONTH_VARIANT_VALUE_MAP)
        .addVariantDescription("1-12", "allowed values")
        .addVariantDescription("JAN-DEC", "alternative values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.DAY_OF_WEEK,
        oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/),
      )
        .setVariantValueMap(DAY_OF_WEEK_VARIANT_VALUE_MAP)
        .addVariantDescription("0-7", "allowed values (sunday is 0 or 7)")
        .addVariantDescription("SUN-SAT", "alternative values"),
    )
    .build(),
  [CronSyntaxKind.AWS]: new CronSyntaxBuilder(
    CronSyntaxKind.AWS,
    "AWS Lambda cron.",
  )
    .setDefault("* * * * * *")
    .build(),
  [CronSyntaxKind.QUARTZ]: new CronSyntaxBuilder(
    CronSyntaxKind.QUARTZ,
    "Quarts scheduler cron.",
  )
    .setDefault("* * * * * * *")
    .build(),
};

export const CRON_SYNTAX_LIST = Object.values(CRON_SYNTAX);
