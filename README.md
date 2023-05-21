# move-qcp

The [Javascript Quote Calculator Plugin](https://developer.salesforce.com/docs/atlas.en-us.cpq_dev_plugins.meta/cpq_dev_plugins/cpq_dev_jsqcp_parent.htm) is useful to add extra functionality to the quote line editor in Salesforce CPQ.

Unfortunately the code is stored as data within Salesforce, making it difficult to manage and track changes effectively.

This sf cli plugin empowers you to create a QCP folder within the repository and deploy it to the target org.
This ensures that your code is safely stored, easily accessible, and conveniently managed alongside your other version-controlled assets.

You can now take advantage of modularization by utilizing modules to split the QCP code into multiple files.

## Install

```bash
sf plugins:install move-qcp
```

## Commands

<!-- commands -->

- [`sf cpq qcp create`](#sf-cpq-qcp-create)
- [`sf cpq qcp deploy`](#sf-cpq-qcp-deploy)

## `sf cpq qcp create`

Create the QCP folder structure.

```
USAGE
  $ sf cpq qcp create

FLAGS
  -n, --name=<value> [required] The name of the QCP.
  -d, --outputdir=<value> Directory path to store the QCP [default: current directory].

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create the QCP folder structure.

EXAMPLES
  sf cpq qcp create -n MyQCP
```

## `sf cpq qcp deploy`

Deploy the QCP to the target org.

```
USAGE
  $ sf cpq qcp deploy

FLAGS
  -u, --targetusername=<value>  [required] A username or alias for the target org.
  -d, --sourcedir=<value> [required] The directory path to the QCP.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Deploy the QCP to the target org.

EXAMPLES
  sf cpq qcp deploy -u orgAlias -d ./qcp
```
