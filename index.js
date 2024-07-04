const movieData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

document.addEventListener('DOMContentLoaded', function () {
    // Fetch data
    fetch(movieData).then(response => response.json()).then((movieData) => {
      console.log(movieData);

      // Create size
      const width = 1000;
      const height = 600;

      // Create SVG container
      const svg = d3.select('.graph')
        .append('svg')
        .attr('width', width + 200)
        .attr('height', height + 100)
        .append('g')
        .attr('transform', 'translate(0,0)');

      // Create a color scale
      const customColors = ['#AFEEEE', '#FFDAB9', '#40E0D0', '#D8BFD8', '#FFF5EE', '#EEE8AA', '#D3D3D3']
      const color = d3.scaleOrdinal(customColors);

      // Give the data to this cluster layout:
      const root = d3.hierarchy(movieData)
            .sum(d => d.value);
    
      // Set position of each element of the hierarchy:
      d3.treemap()
        .size([width, height])
        .padding(0.2)
        (root);

      // Create tooltip
      const tooltip = d3.select('#tooltip');

      // Add rectanegls:
      svg.selectAll('rect')
          .data(root.leaves())
          .enter()
          .append('rect')
          .attr('class', 'tile')
          .attr('data-name', d => d.data.name)
          .attr('data-category', d => d.data.category)
          .attr('data-value', d => d.data.value)
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .style('stroke', 'lightgrey')
          .style('fill', d => color(d.parent.data.name))
          .on('mouseover', function(event, d) {
            tooltip.style('visibility', 'visible')
              .attr('data-value', d.value)
              .html(`Title: ${d.data.name}<br>Sales: $${d.value.toLocaleString()}`);
          })
          .on('mousemove', function(event) {
            const [x, y] = d3.pointer(event);
            tooltip.style('top', (y - 10) + 'px')
              .style('left', (x + 10) + 'px')
          })
          .on('mouseout', function() {
            tooltip.style('visibility', 'hidden');
          });

        // Add text labels:
        svg
          .selectAll("text")
          .data(root.leaves())
          .enter()
          .append("text")
          .attr("x", d => d.x0 + 5) // +5 to adjust position (more right)
          .attr("y", d => d.y0 + 20) // +20 to adjust position (lower)
          .text(d => {
            let text = d.data.name;
            const rectWidth = d.x1 - d.x0;
            const textLength = text.length;
            const charWidth = 7;
            const maxChars = Math.floor(rectWidth / charWidth);
            if (textLength > maxChars) {
              text = text.substring(0, maxChars - 3) + '...';
            }
            return text;
          })
          .attr("font-size", "12px")
          .attr("fill", "black");

        // Add legend
        const categories = movieData.children.map(d => d.name);

        const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('id', 'legend')
          .attr('transform', `translate(${width + 20}, 20)`);

        legend.selectAll('rect')
          .data(categories)
          .enter()
          .append('rect')
          .attr('class', 'legend-item')
          .attr('x', 0)
          .attr('y', (d, i) => i * 20)
          .attr('width', 18)
          .attr('height', 18)
          .style('fill', d => color(d));

        legend.selectAll('text')
          .data(categories)
          .enter()
          .append('text')
          .attr('x', 24)
          .attr('y', (d, i) => i * 20 + 9)
          .attr('dy', '.35em')
          .attr('font-size', '14px')
          .text(d => d);


      }).catch(error => {
        console.error('Error:', error);
      })

    
});

