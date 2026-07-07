const { withAndroidStyles, withMainActivity } = require('@expo/config-plugins');

const FORCE_DARK_SNIPPET = `if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.decorView.isForceDarkAllowed = false
    }`;

function withForceLightAppTheme(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;

    styles.resources.style = styles.resources.style.map((style) => {
      if (style.$?.name !== 'AppTheme') {
        return style;
      }

      return {
        ...style,
        $: {
          ...style.$,
          parent: 'Theme.AppCompat.Light.NoActionBar',
        },
        item: [
          ...(style.item ?? []),
          {
            _: 'false',
            $: {
              name: 'android:forceDarkAllowed',
            },
          },
        ],
      };
    });

    return config;
  });
}

function withForceDarkDisabledMainActivity(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('isForceDarkAllowed')) {
      contents = contents.replace(
        'super.onCreate(null)',
        `super.onCreate(null)\n    ${FORCE_DARK_SNIPPET}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withForceLightCodes(config) {
  config = withForceLightAppTheme(config);
  config = withForceDarkDisabledMainActivity(config);
  return config;
};