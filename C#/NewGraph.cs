using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Windows;
using System.Web.UI.DataVisualization;
using System.Web.UI.DataVisualization.Charting;
using System.Drawing;

namespace RecurringJobs
{
    public class NewGraph
    {
        //Start SAMPLE
        //NewGraph NewGraph = new NewGraph();
        //protected void Page_Load(object sender, EventArgs e)
        //{
        //    Dictionary<string, dynamic> title = new Dictionary<string, dynamic>()
        //    {
        //        {"Title", "CPH Trend"},
        //        {"Font", "Microsoft Sans Serif"},
        //        {"Size", 15}
        //    };

        //    Dictionary<string, dynamic> seriesData = new Dictionary<string, dynamic>()
        //    {
        //        {"CPH", new Dictionary<string, dynamic>() 
        //            {
        //                {"type", "Column"},
        //                {"labels", true},
        //                {"hasGoal", true},
        //                {"goal", 8},
        //                {"trend", true},
        //                {"data", new List<double>() 
        //                    {
        //                        12,10,14,9
        //                    }
        //                }
        //            }
        //        }
        //    };

        //    List<string> yAxisText = new List<string>()
        //    {
        //        "Week 1", "Week 2", "Week 3", "Week 4"
        //    };


        //    Response.Write(NewGraph.Create(title, 254, 494, seriesData, yAxisText));
        //}
        //End SAMPLE

        public string Create(Dictionary<string, dynamic> title, int height, int width, Dictionary<string, dynamic> seriesData, List<string> yAxisText, decimal minYaxis)
        {
            Chart MainChart = new Chart();
            if (height > 0)
            {
                MainChart.Height = height;
            } 
            if (width > 0)
            {
                MainChart.Width = width;
            }
            MainChart.EnableViewState = true;

            MainChart.ChartAreas.Add("ChartArea");

            Title ChartTitle = new Title();
            ChartTitle.Name = "ChartTitle";
            ChartTitle.Text = title["Title"];
            ChartTitle.Font = new Font(title["Font"], title["Size"]);
            MainChart.Titles.Add(ChartTitle);

            MainChart.Legends.Add("ChartTitle");

            if (minYaxis > 0)
            {
                MainChart.ChartAreas["ChartArea"].AxisY.Minimum = System.Convert.ToDouble(minYaxis);
            }

            MainChart.ChartAreas["ChartArea"].AxisX.MajorGrid.LineWidth = 0;
            MainChart.ChartAreas["ChartArea"].AxisY.MajorGrid.LineWidth = 0;

            List<double> yAxisCount = new List<double>();

            foreach (KeyValuePair<string, dynamic> series in seriesData)
            {
                MainChart.Series.Add(series.Key);
                MainChart.Series[series.Key].ChartType = SeriesType(series.Value["type"]);
                MainChart.Series[series.Key].BorderWidth = series.Value["width"];

                List<double> data = seriesData[series.Key]["data"];

                if (yAxisCount.Count == 0)
                {
                    for (int i = 0; i < data.Count; i++)
                    {
                        yAxisCount.Add(i + 1);
                    }
                }

                for (int i = 0; i < data.Count; i++)
                {
                    MainChart.Series[series.Key].Points.AddXY(yAxisText[i], data[i] == 0 ? double.NaN : data[i]);
                    if (series.Value["labels"])
                    {
                        MainChart.Series[series.Key].Points[i].Label = data[i] == 0 ? "" : data[i].ToString();
                    }
                }
                if (series.Value["hasGoal"])
                {
                    double goal = series.Value["goal"];

                    string goalSeries = series.Key + " Goal (" + goal + ")";
                    MainChart.Series.Add(goalSeries);
                    MainChart.Series[goalSeries].ChartType = SeriesChartType.Line;
                    MainChart.Series[goalSeries].BorderWidth = 4;
                    for (int i = 0; i < yAxisText.Count; i++)
                    {
                        MainChart.Series[goalSeries].Points.AddXY(yAxisText[i], goal);
                    }
                }

                if (series.Value["trend"])
                {
                    for (int i = 0; i < 4; i++)
                    {
                        if (seriesData["UPH"]["data"][i] == 0.00)
                        {
                            seriesData["UPH"]["data"][i] = double.NaN;
                        };
                    };
                    data.Remove(double.NaN);
                    data.Remove(double.NaN);
                    data.Remove(double.NaN);
                    data.Remove(double.NaN);

                    double minX = yAxisCount.ToList().Min();
                    double maxX = yAxisCount.ToList().Max();
                    double meanX = 1f * yAxisCount.Sum() / yAxisCount.Count;
                    double meanY = 1f * data.Sum() / data.Count;

                    double st = 0;
                    double sb = 0;
                    for (int i = 0; i < data.Count; i++)
                    {
                        st += (yAxisCount[i] - meanX) * (data[i] - meanY);
                        sb += (yAxisCount[i] - meanX) * (yAxisCount[i] - meanX);
                    }
                    double slope = st / sb;
                    double y0 = meanY - slope * meanX;

                    double start = y0 + minX * slope;

                    string trendCarrot = start <= y0 ? "Down" : "Up";
                    string trendSeries = series.Key + " Trending " + trendCarrot;
                    MainChart.Series.Add(trendSeries);
                    MainChart.Series[trendSeries].ChartType = SeriesChartType.Line;
                    MainChart.Series[trendSeries].BorderDashStyle = ChartDashStyle.Dash;
                    MainChart.Series[trendSeries].BorderWidth = 2;

                    for (int i = 0; i < yAxisCount.Count; i++)
                    {
                        MainChart.Series[trendSeries].Points.AddXY(yAxisText[i], start + ((i + 1) * slope));
                    }
                }
            };

            System.IO.MemoryStream imagestream = new System.IO.MemoryStream();
            MainChart.SaveImage(imagestream, System.Web.UI.DataVisualization.Charting.ChartImageFormat.Png);
            byte[] imageByte = imagestream.ToArray();
            string imageBase64 = Convert.ToBase64String(imageByte);

            return "data:image/png;base64," + imageBase64;
        }

        private SeriesChartType SeriesType(string type)
        {
            switch (type.ToLower())
            {
                case "bar":
                    return SeriesChartType.Bar;
                case "boxplot":
                    return SeriesChartType.BoxPlot;
                case "bubble":
                    return SeriesChartType.Bubble;
                case "candlestick":
                    return SeriesChartType.Candlestick;
                case "column":
                    return SeriesChartType.Column;
                case "doughnut":
                    return SeriesChartType.Doughnut;
                case "errorbar":
                    return SeriesChartType.ErrorBar;
                case "fastline":
                    return SeriesChartType.FastLine;
                case "fastpoint":
                    return SeriesChartType.FastPoint;
                case "funnel":
                    return SeriesChartType.Funnel;
                case "kagi":
                    return SeriesChartType.Kagi;
                case "line":
                    return SeriesChartType.Line;
                case "pie":
                    return SeriesChartType.Pie;
                case "point":
                    return SeriesChartType.Point;
                case "pointandfigure":
                    return SeriesChartType.PointAndFigure;
                case "polar":
                    return SeriesChartType.Polar;
                case "pyramid":
                    return SeriesChartType.Pyramid;
                case "radar":
                    return SeriesChartType.Radar;
                case "range":
                    return SeriesChartType.Range;
                case "rangebar":
                    return SeriesChartType.RangeBar;
                case "rangecolumn":
                    return SeriesChartType.RangeColumn;
                case "renko":
                    return SeriesChartType.Renko;
                case "spline":
                    return SeriesChartType.Spline;
                case "splinearea":
                    return SeriesChartType.SplineArea;
                case "splinerange":
                    return SeriesChartType.SplineRange;
                case "stackedarea":
                    return SeriesChartType.StackedArea;
                case "stackedarea100":
                    return SeriesChartType.StackedArea100;
                case "stackedbar":
                    return SeriesChartType.StackedBar;
                case "stackedbar100":
                    return SeriesChartType.StackedBar100;
                case "stackedcolumn":
                    return SeriesChartType.StackedColumn;
                case "stackedcolumn100":
                    return SeriesChartType.StackedColumn100;
                case "stepline":
                    return SeriesChartType.StepLine;
                case "stock":
                    return SeriesChartType.Stock;
                case "threelinebreak":
                    return SeriesChartType.ThreeLineBreak;
                default:
                    return SeriesChartType.Bar;
            }
        }
    }
}