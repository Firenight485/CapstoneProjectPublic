import { LineChart } from '@mui/x-charts/LineChart';
import { axios_instance } from "@/axios";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from '@mui/material';

// Component to render the weather for different locations on a graph

interface graphProps {
  compareNames: string[];  // locations to show the weather for
  height?: string;
  width?: string;
  margin?: string;
}

// props for hourly weather
interface hourlyWeatherDP {
  fdesc: string;  // partly cloudly, ect
  humidty: number;
  precip: number;
  startTime: string;
  temp: number;
  windSpeed: number;
}

// props for daily weather
interface dailyWeatherDP {
  timePeriod: string;
  fdesc: string;  // partly cloudly, ect
  humidty: number;
  precip: number;
  startTime: string;
  temp: number;
  windSpeed: number;
}


function dateToHour(hourStr:string) {
  let hour = parseInt(hourStr);
  let am_pm = ' pm'
  if (hour == 0) {
    am_pm = ' am'
    hour = 12;
  } else if (hour < 12) {
    am_pm = ' am'
  } else if (hour > 12) {
    hour -= 12;
  }
  return '' + hour + am_pm;
}

const values = [['Temperature', 'temp'], 
                ['Humidty', 'humidity'],
                ['Wind Speed', 'windSpeed'], 
                ['Precipitation', 'precip']];
const forecastTypes = ['Hourly', 'Daily'];

export default function WeatherGraph({compareNames, height, width, margin} : graphProps) {
  const [hourlyDatas, setHourlyDatas] = useState<hourlyWeatherDP[][]>([]);
  const [dailyDatas, setDailyDatas] = useState<dailyWeatherDP[][]>([]);
  const [displayValue, setDisplayValue] = useState('temp');  // currently weather value type
  const [forecastType, setForecastType] = useState('Hourly');  // daily or hourly

  // styles for buttons
  const buttonRowStyles = {
    justifyContent: 'center',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  } as const;

  // get weather for each location
  useEffect(() => {
    const getWeatherData = async() => {
      let repeat = true;
      let repeats = 0;

      // sometimes request fails the first time so repeat
      while (repeat && repeats < 5) {
        repeats++;
        try {
          let tmpHourlyDatas:hourlyWeatherDP[][] = [];
          let tmpDailyDatas:dailyWeatherDP[][] = [];

          for (const locName of compareNames) {
            const response = await axios_instance.get('/api/weather/get/?name=' + locName);
            let hourlyData = JSON.parse(response.data[0].fields.hourly_forecast).slice(0, 23);
            for (const elem of hourlyData) {
              elem.windSpeed = parseInt(elem.windSpeed.split(' ')[0])
            }
            tmpHourlyDatas.push(hourlyData);

            let dailyData = JSON.parse(response.data[0].fields.daily_forecast).slice(0, 23);
            for (const elem of dailyData) {
              elem.windSpeed = parseInt(elem.windSpeed.split(' ')[0])
            }
            tmpDailyDatas.push(dailyData);
          }

          setHourlyDatas(tmpHourlyDatas);
          setDailyDatas(tmpDailyDatas);
          
          repeat = false;
        } catch (error) {
          console.error(error)
        }
      }
    };

    if (compareNames.length > 0) {
      getWeatherData();
    }
  }, [compareNames])

  return (
    <div
      style={{
        height: height,
        width: width,
        margin: margin
      }}
    >
      <div
        style={buttonRowStyles}
      >
        {/* Buttons to select forecast type */}
        {forecastTypes.map((value:any, index) => (
          <Button 
            key={index}
            onClick={() => setForecastType(value)}
            variant={forecastType === value ? "contained" : "outlined"}
          >
            {value}
          </Button>
        ))}
      </div>

      {/* The graph itself */}
      <Box
        sx={{
          height: {xs: '70%', sm: '80', md: '90%'},
        }}
      >
        {hourlyDatas.length > 0 &&
        <LineChart
          xAxis={[{ 
            scaleType: 'point', 
            data: forecastType === 'Hourly' && hourlyDatas.length > 0 ? hourlyDatas[0].map((val:hourlyWeatherDP) => dateToHour(val.startTime)) : 
                  forecastType === 'Daily'  && dailyDatas.length > 0 ? dailyDatas[0].map((val:dailyWeatherDP) => val.timePeriod) : [], 
            label: 'Time of Day'
          }]}
          yAxis={[{ 
            scaleType: 'linear',
            label: displayValue === 'temp' ? 'Temperature (°F)' :
                   displayValue === 'humidity' ? 'Humidity (%)' :
                   displayValue === 'windSpeed' ? 'Wind Speed (MPH)' :
                   displayValue === 'precip' ? 'Percent Chance' : ''
          }]}
          series={
            forecastType === 'Hourly' ? hourlyDatas.map((hourlyData, index) => (
              compareNames[index] !== undefined ? 
              {
                label: compareNames[index].replaceAll('+', ' ').replaceAll('%20', ' '),
                data: hourlyData.map((val:any) => val[displayValue]),
              } : {data : []}
            )) :
            forecastType === 'Daily' ? dailyDatas.map((dailyData, index) => (
              compareNames[index] !== undefined ? 
              {
                label: compareNames[index].replaceAll('+', ' ').replaceAll('%20', ' '),
                data: dailyData.map((val:any) => val[displayValue]),
              } : {data : []}
            )) : [{data: []}]
          }
        />}
      </Box>

      {/* Buttons to select value shown on the graph */}
      <div
        style={buttonRowStyles}
      >
        {values.map((value:any, index) => (
          <Button
            key={index}
            onClick={() => setDisplayValue(value[1])}
            variant={displayValue === value[1] ? "contained" : "outlined"}
          >
            {value[0]}
          </Button>
        ))}
      </div>
    </div>
  );
}
