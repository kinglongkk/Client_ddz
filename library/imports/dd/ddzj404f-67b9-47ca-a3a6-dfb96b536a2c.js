"use strict";
cc._RF.push(module, 'ddzj404f-67b9-47ca-a3a6-dfb96b536a2c', 'i18n');
// script/i18n/i18n.js

'use strict';

var Polyglot = require('polyglot');
var lang = cc.sys.language;
if (lang !== 'zh') {
    lang = 'en';
}
var data = require(lang); // update this to set your default displaying language in editor
// let polyglot = null;
var polyglot = new Polyglot({ phrases: data, allowMissing: true });

module.exports = {
    /**
     * This method allow you to switch language during runtime, language argument should be the same as your data file name
     * such as when language is 'zh', it will load your 'zh.js' data source.
     * @method init
     * @param language - the language specific data file name, such as 'zh' to load 'zh.js'
     */
    init: function init(language) {
        lang = language;
        data = require(lang);
        polyglot.replace(data);
    },

    /**
     * this method takes a text key as input, and return the localized string
     * Please read https://github.com/airbnb/polyglot.js for details
     * @method t
     * @return {String} localized string
     * @example
     *
     * var myText = i18n.t('MY_TEXT_KEY');
     *
     * // if your data source is defined as
     * // {"hello_name": "Hello, %{name}"}
     * // you can use the following to interpolate the text
     * var greetingText = i18n.t('hello_name', {name: 'nantas'}); // Hello, nantas
     */
    t: function t(key, opt) {
        return polyglot.t(key, opt);
    }
};

cc._RF.pop();