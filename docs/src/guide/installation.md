---
title: Installation
description: Installing the Citizen skin to your wiki
---

# Installation

Ready to give your wiki a fresh look? Follow these steps to install Citizen.

## Requirements

* [MediaWiki](https://www.mediawiki.org) 1.43.0 or later

::: details Using older versions of MediaWiki?

Please use one of the following legacy releases:

| Citizen version | MediaWiki version |
| :--- | :--- |
| [2.40.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases/tag/v2.40.2) | 1.39.4 – 1.42.7 |
| [1.17.9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases/tag/v1.17.9) | 1.35.2 – 1.39.3 |

:::

## Get the skin

:::: tabs
== Manual

1. [Download the latest release](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/archive/refs/heads/main.zip).
2. Extract the contents into a directory called `Citizen` in your `skins/` folder.

```text
mediawiki/
└── skins/
    └── Citizen/
        ├── skin.json
        ├── i18n/
        ├── includes/
        ├── resources/
        └── ...
```

== Composer
Run the following commands in the root of your MediaWiki installation:

```sh
COMPOSER=composer.local.json composer require starcitizentools/citizen-skin
composer update --no-dev
```

== Git
Run the following command in the root of your MediaWiki installation:

```sh
git clone https://github.com/StarCitizenTools/mediawiki-skins-Citizen.git skins/Citizen
```

::: tip Note
Using `git` allows `Special:Version` to display the current commit ID. To link the commit ID to GitHub, add the following to your `LocalSettings.php`:

```php [LocalSettings.php]
$wgGitRepositoryViewers['https://github.com/(.*?)(.git)?'] = 'https://github.com/$1/commit/%H';
```

:::

::: warning
The `git` repository includes development files. For production environments where file size is a concern, consider using the **Manual** or **Composer** methods.
:::
::::

## Activate

To enable the skin, add this to your `LocalSettings.php`:

```php [LocalSettings.php]
wfLoadSkin( 'Citizen' );
```

Head over to `Special:Version` to verify that the skin is successfully enabled.

## Configure

### Set as default

To set Citizen as the wiki's default skin, add this to your `LocalSettings.php`:

```php [LocalSettings.php]
$wgDefaultSkin = 'citizen';
```

### Next steps

Citizen works out of the box without additional configuration, but you can customize it further:

* **[Skin configuration](../config/index.md)**: Tweak colors, layout, and features.
* **[Extension support](../config/extensions.md)**: Configure Citizen's improved support for popular extensions.
