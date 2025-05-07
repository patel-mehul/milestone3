import React, { useState, useEffect } from "react";
import { Grid, Box, Card, Typography } from "@mui/material";
import DropdownWithSearch from "./components/DropdownWithSearch";
import SocialMediaTreemap from "./components/TreemapChart";
import LineChart from "./components/LineChart";

function App() {
  const [options, setOptions] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState("");

  function calculateAverages(dataArray) {
    const platformSums = {};
    const platformCounts = {};

    // Initialize all platforms
    const firstEntry = dataArray[0];
    for (const key in firstEntry) {
      if (key !== '"Date"') {
        platformSums[key] = 0;
        platformCounts[key] = 0;
      }
    }

    // Sum up all values
    dataArray.forEach((entry) => {
      for (const [platform, value] of Object.entries(entry)) {
        if (platform !== '"Date"') {
          const numValue = parseFloat(value);
          platformSums[platform] += numValue;
          if (numValue > 0) {
            platformCounts[platform]++;
          }
        }
      }
    });

    // Calculate averages
    const averages = {};
    for (const platform in platformSums) {
      averages[platform] = platformSums[platform] / dataArray.length;
    }

    return averages;
  }

  const averages = calculateAverages(data);
  for (const [platform, average] of Object.entries(averages)) {
    console.log(`${platform.replace(/"/g, "")}: ${average.toFixed(2)}`);
  }

  const convertCsvToJson = (csv) => {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
    }

    return result;
  };

  const fetchCsvData = async () => {
    try {
      const response = await fetch("./social_media.csv");
      if (!response.ok) {
        throw new Error("Failed to fetch CSV data");
      }
      const csvData = await response.text();
      return convertCsvToJson(csvData);
    } catch (error) {
      console.error("Error fetching CSV data:", error);
      return [];
    }
  };

  const handleOptionSelect = (selectedOption) => {
    let filtered = data.filter(
      (item) => item['"Date"'].split("-")[0] === selectedOption
    );

    setFilteredData(filtered);
    setSelectedMedia("");
  };

  useEffect(() => {
    const fetchData = async () => {
      const jsonData = await fetchCsvData();

      // Process the data first
      let dateOptions = jsonData.map((d) => d['"Date"'].split("-")[0]);
      dateOptions = [
        ...new Set(dateOptions.filter((d) => d != null && d !== "")),
      ].sort();

      // Update both states at once
      setData(jsonData);
      setOptions(dateOptions);

      // Filter the data directly using jsonData (not state)
      if (dateOptions.length > 0) {
        const initialFiltered = jsonData.filter(
          (item) => item['"Date"'].split("-")[0] === dateOptions[0]
        );
        setFilteredData(initialFiltered);
      }
    };
    fetchData();
  }, []);

  if (data.length === 0) {
    return <></>;
  }

  return (
    <div className="App">
      <Typography variant="h4" textAlign={"center"}>
        Social Media Usage Share Per Year
      </Typography>

      <Box
        sx={{
          mt: 1,
          ml: 1,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <DropdownWithSearch options={options} onSelect={handleOptionSelect} />
      </Box>

      <br />
      <Grid container spacing={2}>
        <Grid item sm={12} xs={12}>
          <Card
            sx={{
              width: "100%",
              minHeight: 300,
              boxShadow:
                "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              textAlign: "center",
            }}
          >
            <SocialMediaTreemap
              data={calculateAverages(filteredData)}
              selectedPlatform={selectedMedia}
              setSelectedPlatform={setSelectedMedia}
            />
          </Card>
        </Grid>
      </Grid>
      {selectedMedia !== "" && (
        <>
          <br />

          <Grid container spacing={2} mb={1}>
            <Grid item sm={12} xs={12} ml={1}>
              <Card
                sx={{
                  width: "100%",
                  minHeight: 300,
                  boxShadow:
                    "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  textAlign: "center",
                }}
              >
                <LineChart data={filteredData} option={selectedMedia} />
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
}

export default App;
