# summary

Deploy the QCP to the target org.

# flags.targetusername.summary

A username or alias for the target org.

# flags.sourcedir.summary

The path to the main file of the QCP.

# flags.no-code-minification.summary

Deploy without code minification.

# error.Deploy

Deploy failed: %s.

# examples

- Deploy QCP:

  <%= config.bin %> <%= command.id %> --targetusername <username|alias> --pathmain <path> --qcpname <name>
