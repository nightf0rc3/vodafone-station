import VodafoneBox, {
  EditPortMappingRule,
  NewPortMappingRule,
  PortMappings,
  TEditRule,
  UpdatePortMappings,
} from "../src";

const mapData = (portMappings: PortMappings): UpdatePortMappings => ({
  mEditRule: portMappings.mapping.map<EditPortMappingRule>(
    ([
      name,
      ipAddress,
      protocol,
      externalPort,
      externalPortEndRange,
      internalPort,
      internalPortEndRange,
      enable,
      index,
      ruleSource,
    ]) => ({
      name: ruleSource === "UPnP" ? "TestRule" : name,
      ipAddress,
      protocol,
      externalPort,
      externalPortEndRange,
      internalPort,
      internalPortEndRange,
      enable,
      index,
      ruleSource,
    })
  ),
  tEditRule: portMappings.trigger.map<TEditRule>(
    ([
      name,
      triggerPortStart,
      triggerPortEnd,
      triggerProtocol,
      forwardPortStart,
      forwardPortEnd,
      forwardProtocol,
      enable,
      index,
    ]) => ({
      name,
      triggerPortStart,
      triggerPortEnd,
      triggerProtocol,
      forwardPortStart,
      forwardPortEnd,
      forwardProtocol,
      enable,
      index,
    })
  ),
});

(async () => {
  try {
    const vodafoneBox = new VodafoneBox("192.168.0.1");
    await vodafoneBox.login("admin", "test");

    const portMappings = await vodafoneBox.getPortMappings();

    const newPortMappings = mapData(portMappings.portMappings);
    const newRule: NewPortMappingRule = {
      name: "script",
      ipAddress: "192.168.0.210",
      protocol: "TCP",
      externalPort: "69",
      externalPortEndRange: "69",
      internalPort: "69",
      internalPortEndRange: "69",
      enable: "true",
      index: -1,
    };
    newPortMappings.mEditRule.push(newRule);
    await vodafoneBox.updatePortMappings(newPortMappings);

    console.log("updated port mappings");

    await vodafoneBox.logout();
  } catch (err) {
    console.log(err);
  }
})();
