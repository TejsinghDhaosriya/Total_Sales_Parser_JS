const fs = require("fs");
const filePath = "sales_input_data.txt";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "Jun",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let totalSales = 0;

let monthWiseSales = {};
months.forEach((month) => {
  monthWiseSales[[month]] = {};
});

let rows = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);

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

const getMonthsWiseSales = (item, month) => {
  if (monthWiseSales[month].totalSales)
    monthWiseSales[month].totalSales += parseInt(item.total_price);
  else {
    monthWiseSales[month].totalSales = parseInt(item.total_price);
    monthWiseSales[month]["most_popular"] = {};
    monthWiseSales[month]["most_revenue"] = {};
    monthWiseSales[month].min = Infinity;
    monthWiseSales[month].max = 0;
    monthWiseSales[month].count = 0;
  }
};
dataset.forEach((item) => {
  totalSales += parseInt(item.total_price);
  let date = new Date(item.date);
  let monthIndex = date.getMonth();
  let month = months[monthIndex];
  getMonthsWiseSales(item, month);
  if (!monthWiseSales[month]["most_popular"][item.sku])
    monthWiseSales[month]["most_popular"][item.sku] = parseInt(item.quantity);
  else
    monthWiseSales[month]["most_popular"][item.sku] += parseInt(item.quantity);

  if (!monthWiseSales[month]["most_revenue"][item.total_price])
    monthWiseSales[month]["most_revenue"][item.sku] = parseInt(
      item.total_price
    );
  else
    monthWiseSales[month]["most_revenue"][item.sku] += parseInt(
      item.total_price
    );
});

Object.keys(monthWiseSales).map(function (x) {
  if (monthWiseSales[x].hasOwnProperty("most_popular")) {
    let maxValue = Math.max.apply(
      null,
      Object.keys(monthWiseSales[x]["most_popular"]).map(function (y) {
        return monthWiseSales[x]["most_popular"][y];
      })
    );
    let maxKey = Object.keys(monthWiseSales[x]["most_popular"]).filter(
      function (z) {
        return monthWiseSales[x]["most_popular"][z] == maxValue;
      }
    )[0];
    monthWiseSales[x]["most_popular"] = {};
    monthWiseSales[x]["most_popular"][maxKey] = maxValue;
  }

  if (monthWiseSales[x].hasOwnProperty("most_revenue")) {
    let maxValue = Math.max.apply(
      null,
      Object.keys(monthWiseSales[x]["most_revenue"]).map(function (y) {
        return monthWiseSales[x]["most_revenue"][y];
      })
    );
    let maxKey = Object.keys(monthWiseSales[x]["most_revenue"]).filter(
      function (z) {
        return monthWiseSales[x]["most_revenue"][z] == maxValue;
      }
    )[0];
    monthWiseSales[x]["most_revenue"] = {};
    monthWiseSales[x]["most_revenue"][maxKey] = maxValue;
  }
  return monthWiseSales[x];
});

dataset.forEach((item) => {
  let date = new Date(item.date);
  let monthIndex = date.getMonth();
  let month = months[monthIndex];
  if (monthWiseSales[month]) {
    let sku = Object.keys(monthWiseSales[month]["most_popular"]);
    if (item.sku === sku[0]) {
      monthWiseSales[month].min = Math.min(
        monthWiseSales[month].min,
        item.quantity
      );
      monthWiseSales[month].max = Math.max(
        monthWiseSales[month].max,
        item.quantity
      );
      monthWiseSales[month].count++;
    }
  }
});

Object.keys(monthWiseSales).map(function (x) {
  if (monthWiseSales[x]["most_popular"]) {
    let total = Object.values(monthWiseSales[x]["most_popular"]);
    monthWiseSales[x]["avg"] = total[0] / monthWiseSales[x]["count"];
    delete monthWiseSales[x]["count"];
  }
  return monthWiseSales[x];
});

console.log("totalSales", totalSales);
console.log("monthWiseSales", monthWiseSales);
