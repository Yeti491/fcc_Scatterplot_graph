const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const baseTmp = 8.66;
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


// Fetch data
const obtainData = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.monthlyVariance;
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
};

// create tooltip element
const tooltip = d3.select('#tooltip');

//showData
const showData = async () => {
    const dataset = await obtainData();
    console.log(dataset)

    // set chart dimentions
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const padding = 50;

    // create SVG element
    const svg = d3.select('.graph')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

    // create scales
    const xScale = d3.scaleLinear()
                    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
                    .range([padding, width]);

    const yScale = d3.scaleBand()
                    .domain(d3.range(1, 13))
                    .range([padding, height])
                    .paddingInner(0.05);

    // create x and y axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => {
        const date = new Date(0);
        date.setUTCMonth(d - 1);
        return d3.timeFormat('%B')(date);
    });

    // add axes
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`)
        .call(yAxis);

    // create temperature array
    dataset.forEach((d) => {
        d.temp = baseTmp + d.variance;
    })

    // create color scale
    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain(d3.extent(dataset, d => d.variance));

    // add cells
    svg.selectAll('.cell')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.month))
        .attr('data-month', d => d.month -1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.temp)
        .attr('width', (width -2 * padding) / (d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.variance))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

    // show tooltip
    function showTooltip(event, d) {
        const [x, y] = d3.pointer(event, this);
        const monthName = monthNames[d.month -1]
        tooltip.style('display', 'block')
                .style('opacity', .9)
                .attr('data-year', d.year)
                .html(`${d.year} - ${monthName}<br>${d.temp.toFixed(2)}<br>${d.variance}`)
                .style('left', (x + 10) + 'px')
                .style('top', (y + 10) + 'px')
        d3.select(this).attr('fill', 'yellow')
    };

    // hide tooltip
    function hideTooltip(event, d) {
        const [x, y] = d3.pointer(event, this);
        tooltip.style('display', 'none');
        d3.select(this).attr('fill', d => colorScale(d.variance))
    };

    //add y-title
    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .text('Months');

    //add x-title
    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('transform', 'rotate(0)')
        .attr('y', height + margin.bottom - 20)
        .attr('x', width / 2)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .text('Years');

    // add legends
    const numColors = 9;
    const colorDomain = d3.range(numColors).map(i => i / (numColors -1));
    const legendColors = colorDomain.map(colorScale);
    console.log(legendColors);

    const legendContainer = d3.select('#legend')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 80);

    const legendCellWidth = 600 / numColors;

    legendContainer.selectAll('.legend-cell')
        .data(legendColors)
        .enter()
        .append('rect')
        .attr('class', 'legend-cell')
        .attr('x', (d, i) => i * legendCellWidth)
        .attr('y', 0)
        .attr('width', legendCellWidth)
        .attr('height', 20)
        .attr('fill', d => d);

    legendContainer.selectAll('.legend-text')
                .data(legendColors)
                .enter()
                .append('text')
                .attr('class', 'legend-text')
                .attr('x', (d, i) => i * legendCellWidth + legendCellWidth / 2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text((d, i) => {
                    const minTemp = d3.min(dataset, d => d.variance + baseTmp)
                    const maxTemp = d3.max(dataset, d => d.variance + baseTmp)
                    const step = (maxTemp - minTemp) / (numColors - 1);
                    const value = minTemp + i * step;
                    return value.toFixed(2) + '°C';
                });       
};

showData();