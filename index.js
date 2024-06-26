const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// Fetch data
const obtainData = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
};

const showData = async () => {
    const dataset = await obtainData();
    console.log(dataset)

    dataset.forEach(d => {
        if (d.Doping) {
            d.category = 'doping';
        } else {
            d.category = 'nonDoping'
        }
    })

    const colorScale = d3.scaleOrdinal()
                        .domain(['doping', 'nonDoping'])
                        .range(['red', 'blue'])

    // set chart dimentions
    const margin = { top: 50, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // create SVG element
    const svg = d3.select('.graph')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

    // create scales
    dataset.forEach(d => {
        d.Year = new Date(d.Year.toString());
        d.Time = new Date('1970-01-01T00:' + d.Time.toString());
    });
    
    const xScale = d3.scaleTime()
                    .domain([new Date('1993-01-01'), d3.max(dataset, d => d.Year)])
                    .range([0, width]);

    const yScale = d3.scaleTime()
                    .domain(d3.extent(dataset, d => d.Time))
                    .nice()
                    .range([height, 0]);

    // create x and y axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

    // add axes
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

    svg.append('g')
        .attr('id', 'y-axis')
        .call(yAxis);

    // add dots
    svg.selectAll('.dot')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(d.Time))
        .attr('data-xvalue', d => d.Year.toISOString())
        .attr('data-yvalue', d => d.Time.toISOString())
        .attr('r', 5)
        .attr('fill', d => colorScale(d.category))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

    // create tooltip element
    const tooltip = d3.select('#tooltip');

    function showTooltip(event, d) {
        tooltip.style('display', 'block')
                .style('opacity', .9)
                .html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year.getFullYear()}, Time: ${d3.timeFormat('%M:%S')(d.Time)}<br><br>${d.category === 'doping' ? "Doping Allegation: " + d.Doping : "No Doping Allegation"}`)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .attr('data-year', d.Year.toISOString());
    }

    function hideTooltip() {
        tooltip.style('display', 'none');
    };

    //add y-title
    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .text('Time in Minutes')

    // add legends

    const legendData = [
        {label: 'No doping allegations', color: 'blue' },
        {label: 'Rides with doping allegations', color: 'red'}
    ]
        
    const legend = svg.append('g')
                        .attr('id', 'legend')
                        .attr('class', 'legend')
                        .attr('transform', 'translate(600, -40)');

    legend.selectAll('rect')
            .data(legendData)
            .enter().append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 20)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', d => d.color)

    legend.selectAll('text')
            .data(legendData)
            .enter().append('text')
            .attr('x', 15)
            .attr('y', (d, i) => i * 20 + 10)
            .text(d => d.label)
            .attr('font-size', '14px')
            .attr('alignment-baseline', 'middle')
   
}

showData()







