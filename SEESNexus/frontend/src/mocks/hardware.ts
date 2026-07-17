import { Hardware, HardwareCategory, HardwareStatus } from "../types";

// Fallback data shown when the /hardware API is unreachable.
// No image_url — Pollinations.ai generates images dynamically from name + category.
export const MOCK_HARDWARE: Hardware[] = [
  {
    id: "1",
    name: "Arduino Uno R3",
    category: HardwareCategory.MICROCONTROLLER,
    description:
      "Atmega328P microcontroller, perfect for basic electronics and prototyping.",
    available_quantity: 12,
    quantity: 15,
    status: HardwareStatus.AVAILABLE,
  },
  {
    id: "2",
    name: "Raspberry Pi 4 Model B",
    category: HardwareCategory.MICROCONTROLLER,
    description:
      "8GB RAM Quad-core 64-bit ARM CPU. High performance embedded computing.",
    available_quantity: 0,
    quantity: 5,
    status: HardwareStatus.BORROWED,
  },
  {
    id: "3",
    name: "Digital Oscilloscope",
    category: HardwareCategory.MEASUREMENT,
    description:
      "100MHz Dual Channel digital storage oscilloscope for signal analysis.",
    available_quantity: 2,
    quantity: 3,
    status: HardwareStatus.AVAILABLE,
  },
  {
    id: "4",
    name: "Lidar Sensor V4",
    category: HardwareCategory.COMPONENT,
    description:
      "Time-of-flight optical distance sensor for robotics and mapping.",
    available_quantity: 8,
    quantity: 10,
    status: HardwareStatus.AVAILABLE,
  },
];
