![minerstat logo](https://cdn.rawgit.com/minerstat/minerstat-locator/master/docs/logo_full.svg)

# Locator by minerstat

Locator was brought to you by minerstat to quickly find all of the ASICs connected to your local network. It allows you to export JSON file that can be imported as a workers list in [your minerstat dashboard](https://my.minerstat.com).

## How it works?

![Locator](https://cdn.rawgit.com/minerstat/minerstat-locator/master/docs/locator.svg)

## JSON example

If you want to create your own JSON file to import workers to your minerstat dashboard, you can follow this template.

```
[
    {
        "worker": "Rig0001",
        "type": "nvidia",
        "system": "msos",
        "groups": "GTX1080,Claymore",
        "ip": "",
        "ssh-username": "",
        "ssh-password": ""
    },
   {
        "worker": "S90001",
        "type": "asic",
        "system": "antminer",
        "groups": "Area 1",
        "ip": "192.168.0.05",
        "ssh-username": "root",
        "ssh-password": "admin"
    },
    {
        "worker": "S90002",
        "type": "asic",
        "system": "antminer",
        "groups": "Area 1",
        "ip": "192.168.0.07",
        "ssh-username": "root",
        "ssh-password": "admin"
    }
]
```

Please, if you are using custom templates, follow the next rules:
1. `type` must be one of the following: `nvidia`, `amd`, or `asic`.
2. `system` must be `msos` or `windows` if the type is `nvidia` or `amd`.
3. `system` must be `antminer`, `baikal`, or `dragonmint` if the type is `asic`.
4. `groups` must be divided with comma. Group name should not exceed the length of 10 characters.
5. `worker` should not exceed the length of 15 characters.
6. `ssh-username` and `ssh-password` are used only for type `asic` and are not the same as on web interace. Default username/password for `antminer` is `root/admin`, for `baikal` is `admin/root`, and for `dragonmint` is `admin/dragonadmin`.
