### Example of Usage

This example shows show how to use val to log the logging stream from postfix into mongo.

The flow pretty much goes like

```
postfix -> logfile (this grows) -> val -> regex -> mongo

```


