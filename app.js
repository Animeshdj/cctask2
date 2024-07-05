import e from "express";
import { Browser, Builder, By, until } from "selenium-webdriver";
//scraper
let gpus = {};
const getData = async () => {
  const driver = new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get("https://www.nvidia.com/en-in/geforce/buy/");

    const parentElement = await driver.wait(
      until.elementLocated(By.id("container-0c56a80eb9")),
      10000
    );

    const childElements = await parentElement.findElements(By.xpath(".//*"));

    let currentGpu = "";
    for (let i = 0; i < childElements.length; i++) {
      const element = childElements[i];
      const className = await element.getAttribute("class");
      if (
        className.includes(
          "nv-title text h--small aem-GridColumn aem-GridColumn--default--10"
        )
      ) {
        currentGpu = await element.getText();
        gpus[currentGpu] = "N/A";
      } else if (className.includes("startingprice")) {
        const text = await element.getText();
        const priceNumber = parseInt(
          text.split("Rs. ").pop().replace(/,/g, "")
        );
        gpus[currentGpu] = priceNumber;
        currentGpu = "";
      }
    }

    // console.log(gpus);
  } finally {
    await driver.quit();
  }
};
getData();
//server
const app = e();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  try {
    res.status(200).json(gpus);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
});

app.listen(6969);
