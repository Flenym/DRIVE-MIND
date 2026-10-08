// eslint flat config — Author: Flenym
const expo = require('eslint-config-expo/flat');
module.exports = [...expo, { ignores: ['ios-native/**', 'node_modules/**', 'dist/**'] }];
