declare const __ENKA_BUILD_COMMIT__: string;
declare const __ENKA_BUILD_TIME__: string;

export const buildInfo = {
  commit: __ENKA_BUILD_COMMIT__,
  builtAt: __ENKA_BUILD_TIME__,
};
