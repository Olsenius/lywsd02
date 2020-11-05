// Read the battery level of the first found peripheral exposing the Battery Level characteristic

const noble = require("@abandonware/noble");
const binary = require("binary");

const serviceId = "ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6";
const characteristicId = "ebe0ccb7-7a0a-4b0c-8a1a-6ff2997da3a6";
const device = "e7-2e-00-33-8c-6d";

JSON.safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    console.log("scanning");
    await noble.startScanningAsync(
      [
        serviceId,
        "0xfe95",
        // "0x1f10",
      ],
      false
    );
  }
});

noble.on("discover", async (peripheral) => {
  //   console.log(
  //     `Discover ${peripheral.address} ${peripheral.advertisement.localName}`
  //   );
  if (peripheral.address === device || true) {
    // console.log(
    //   `Connect ${peripheral.address} ${peripheral.advertisement.localName}`
    // );

    //   await noble.stopScanningAsync();
    await peripheral.connectAsync();
    // console.log(
    //   `Connected ${peripheral.address} ${peripheral.advertisement.localName}`
    // );
    const {
      services,
      characteristics,
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [serviceId],
      [characteristicId]
    );
    //   console.log(JSON.safeStringify(characteristics));
    const b = await characteristics[0].readAsync();
    console.log(peripheral.advertisement.localName, peripheral.address, b);
    if (b.length === 5) {
      const values = binary.parse(b).word32le("time").word8s("offset").vars;
      console.log(new Date(1000 * values.time));
      console.log(values.offset);
    } else if (b.length === 4) {
      console.log("---------------");
    }
    await peripheral.disconnectAsync();
    //   process.exit(0);
  }
});
