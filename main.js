import fs from "fs";
import months from "./year.js";

let totalSales = 0;
let monthSales = {};

months.forEach((month) => {
  monthSales[[month]] = {};
});

let rows = fs
  .readFileSync("sales_input_data.txt", "utf-8")
  .split("\n")
  .filter(Boolean);

let dataset = rows.map((line) => {
  line = line.split(",");
  return {
    date: line[0],
    sku: line[1],
    unit_price: line[2],
    quantity: line[3],
    total_price: line[4].trim(),
  };
});

dataset.shift();

const monthsWiseSales = (item, month) => {
  if (monthSales[month].totalSales)
    monthSales[month].totalSales += parseInt(item.total_price);
  else {
    monthSales[month].totalSales = parseInt(item.total_price);
    monthSales[month]["popular"] = {};
    monthSales[month]["revenue"] = {};
    monthSales[month].min = Infinity;
    monthSales[month].max = 0;
    monthSales[month].count = 0;
  }
};
dataset.forEach((item) => {
  totalSales += parseInt(item.total_price);
  let date = new Date(item.date);
  let monthIndex = date.getMonth();
  let month = months[monthIndex];
  monthsWiseSales(item, month);
  if (!monthSales[month]["popular"][item.sku])
    monthSales[month]["popular"][item.sku] = parseInt(item.quantity);
  else monthSales[month]["popular"][item.sku] += parseInt(item.quantity);

  if (!monthSales[month]["revenue"][item.total_price])
    monthSales[month]["revenue"][item.sku] = parseInt(item.total_price);
  else monthSales[month]["revenue"][item.sku] += parseInt(item.total_price);
});

Object.keys(monthSales).map((month) => {
  if (monthSales[month].hasOwnProperty("popular")) {
    let maxValue = Math.max.apply(
      null,
      Object.keys(monthSales[month]["popular"]).map(function (y) {
        return monthSales[month]["popular"][y];
      })
    );
    let maxKey = Object.keys(monthSales[month]["popular"]).filter(function (z) {
      return monthSales[month]["popular"][z] == maxValue;
    })[0];
    monthSales[month]["popular"] = {};
    monthSales[month]["popular"][maxKey] = maxValue;
  }

  if (monthSales[month].hasOwnProperty("revenue")) {
    let maxValue = Math.max.apply(
      null,
      Object.keys(monthSales[month]["revenue"]).map(function (y) {
        return monthSales[month]["revenue"][y];
      })
    );
    let maxKey = Object.keys(monthSales[month]["revenue"]).filter(function (z) {
      return monthSales[month]["revenue"][z] == maxValue;
    })[0];
    monthSales[month]["revenue"] = {};
    monthSales[month]["revenue"][maxKey] = maxValue;
  }
  return monthSales[month];
});

dataset.forEach((item) => {
  let date = new Date(item.date);
  let monthIndex = date.getMonth();
  let month = months[monthIndex];
  if (monthSales[month]) {
    let sku = Object.keys(monthSales[month]["popular"]);
    if (item.sku === sku[0]) {
      monthSales[month].min = Math.min(monthSales[month].min, item.quantity);
      monthSales[month].max = Math.max(monthSales[month].max, item.quantity);
      monthSales[month].count++;
    }
  }
});

Object.keys(monthSales).map((month) => {
  if (monthSales[month]["popular"]) {
    let total = Object.values(monthSales[month]["popular"]);
    monthSales[month]["avg"] = total[0] / monthSales[month]["count"];
    delete monthSales[month]["count"];
  }
  return monthSales[month];
});

console.log("Total Sales", totalSales);
console.log("Month Sales", monthSales);
