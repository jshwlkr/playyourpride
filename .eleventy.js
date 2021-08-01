const fs = require("fs");
const { DateTime } = require("luxon");
const pluginRSS = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");
const tinyCSS = require('@sardine/eleventy-plugin-tinycss');
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const htmlmin = require("html-minifier");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRSS);
  eleventyConfig.addPlugin(pluginNavigation);

  const tinyOptions = {
    output: '_site',
  };

  eleventyConfig.addPlugin(tinyCSS, tinyOptions);

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if( outputPath && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.setDataDeepMerge(true);

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
      return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });

  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    // pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
