# Automatic Keyword Link Finder Plugin

## Table of Contents

- [Roadmap](#roadmap)
- [How to Contribute](#how-to-contribute)
- [Releases](#releases)

---

This plugin was created based on the sample plugin for Obsidian from [Obsidian.md](https://obsidian.md). The starter template is sourced from the [Obsidian Sample Plugin Repository](https://github.com/obsidianmd/obsidian-sample-plugin). This is an open-source project, and contributions are welcome.

This project utilizes TypeScript to provide type checking and documentation for an enhanced development experience.

## Roadmap

1. Improve the keyword selection algorithm by removing words without meanings (with an option to enable or disable this feature).
2. Add an undo function to remove the links that have just been added.
3. Enhance the keyword algorithm to accept sequences of words, not just individual words.
4. Improve the keyword algorithm to link words with the same meaning but in different forms (e.g., verbs with different conjugations linked to the same destination).
5. Add language selection in the general settings of the extension (English and French by default).
6. Add the possibility to remove a specific link from every notes. (with an input and a button "remove all links [[keyword]]")

## How to Contribute

### Get started
Here's a quick start guide for new plugin developers:

- Clone this repository to a local development folder by executing `git clone https://github.com/damien-schneider/obsidian-plugin-auto-link.git`.
- For convenience, you can clone this `obsidian-plugin-auto-link` into your `.obsidian/plugins/` folder, where you have set up your development vault (a copy of a vault).
- It is recommended to activate the [Hot Reload](https://github.com/pjeby/hot-reload) plugin in your development vault to automatically reload your plugin when you save changes.
- Install Node.js, then run `yarn` to install all the required packages.
- Run `yarn dev` to compile your plugin from `main.ts` to `main.js` every time you save a file.
- Reload Obsidian to load the new version of your plugin (only if you haven't set up the Hot Reload plugin, which is highly recommended for convenience).

### Useful Ressources
- Unofficial documentation for Obsidian developers: [Documentation](https://marcus.se.net/obsidian-plugin-docs/).
- Feel free to use [Gitmoji](https://gitmoji.dev/) to commit your changes for better readability of the commits.

---

## Releases

0.0.1 - In development
