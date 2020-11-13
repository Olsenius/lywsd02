const noble = require("@abandonware/noble");

const serviceId = "ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6";
const characteristicId = "ebe0ccb7-7a0a-4b0c-8a1a-6ff2997da3a6";
const device = "e7-2e-00-33-8c-6d";

const toBuffer = (date, offset) => {
  const buf1 = Buffer.alloc(5);
  buf1.writeInt32LE(date.getTime() / 1000, 0);
  buf1.writeInt8(offset, 4);
  return buf1;
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
  await peripheral.connectAsync();
  const {
    services,
    characteristics,
  } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
    [serviceId],
    [characteristicId]
  );
  const b = await characteristics[0].readAsync();
  console.log(peripheral.advertisement.localName, peripheral.address, b);
  if (b.length === 5) {
    const time = new Date(1000 * b.readInt32LE(0));
    const offset = b.readInt8(4);
    console.log(`Got time ${time} and offset ${offset}`);
  } else if (b.length === 4) {
    const time = new Date(1000 * b.readInt32LE(0));
    console.log(`Got time ${time}`);
  }
  const now = new Date();
  const offset = Math.abs(now.getTimezoneOffset() / 60);
  const buffer = toBuffer(now, offset);
  console.log("Writing new time", now, buffer);
  await characteristics[0].writeAsync(buffer, false);
  await peripheral.disconnectAsync();
});
