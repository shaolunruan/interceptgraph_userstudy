import * as d3 from "d3";
import axios from 'axios'

import item_pairs  from '../configuration/item_pairs'



const slopechart_build= (svg_id, src) => {

    /*如果 dom_id 没有的话，报错*/
    if (d3.select(`${svg_id}`).size()==0){
        console.log("'svg_id' not found")
        return
    }

    const svg = d3.select(`${svg_id}`)

    /*width height 为 svg 画布的长宽，cx cy是画布的中心, r 是 IG 半径（默认0.8倍的 cx或cy）*/
    const [width] = svg.attr('width').match(/\d+/g) || ['600'], [height] = svg.attr('height').match(/\d+/g) || ['600']


    axios.get(src)
        .then(data__=>{

            let data_ = data__.data

            /*转换 csv text形式 到csv 对象形式*/
            let data = {}
            d3.csvParseRows(data_).map(d=>{
                data[d[0]] = {
                    'item': d[0],
                    'd1': +d[1],
                    'd2': +d[2]
                }
            })


            /*先将 所有的数据按照 上升和下降 进行区分*/
            let data_rise, data_drop

            data_rise = Object.fromEntries(Object.entries(data).filter(d=>{
                return d[1]['d2'] - d[1]['d1'] >= 0
            }))

            data_drop = Object.fromEntries(Object.entries(data).filter(d=>{
                return d[1]['d2'] - d[1]['d1'] < 0
            }))


            /* params */
            const block_width_max = 400, block_height_max = 600
            const block_width = d3.min([0.5*width, block_width_max]), block_height = d3.min([0.7*height, block_height_max])
            const padding_left = (width - block_width)/2, padding_top = (height - block_height)/2


            const color_rise = '#0d597e', color_drop = '#9d2325'
            // const color_rise = '#1f77b4', color_drop = '#1f77b4'




            /************开始画图************/


            /*开始计算 对上升和下降的 extent*/
            let extent_rise = d3.extent(Object.values(data_rise).map(d=>d['d1']).concat(Object.values(data_rise).map(d=>d['d2'])))
            let extent_drop = d3.extent(Object.values(data_drop).map(d=>d['d1']).concat(Object.values(data_drop).map(d=>d['d2'])))

            let [min, max] = d3.extent(extent_rise.concat(extent_drop))

            let scale = d3.scaleLinear()
                // .domain([min, max])/*TODO*/
                .domain([min, max])
                .range([block_height, 0]);


            /* 画两条站着的坐标轴 */
            svg.append('g')
                .attr('transform', `translate(${padding_left},${padding_top})`)
                .call(d3.axisRight()
                    .scale(scale))

            svg.append('g')
                .attr('transform', `translate(${padding_left+block_width},${padding_top})`)
                .call(d3.axisLeft()
                    .scale(scale))



            /* 画line segment */
            /* 上升 */
            svg.selectAll('.lineSegment_rise')
                .data(Object.values(data_rise))
                .join('line')
                .classed('lineSegment_rise', true)
                .attr('x1', padding_left)
                .attr('y1', d=>padding_top+scale(d['d1']))
                .attr('x2', padding_left+block_width)
                .attr('y2', d=>padding_top+scale(d['d2']))
                .attr('stroke', color_rise)
                .attr('id', d=>d['item'])
                .append('title')
                .text(d=>`${d.item}   Δ=${d['d2']-d['d1']}`)


            /* 下降 */
            svg.selectAll('.lineSegment_drop')
                .data(Object.values(data_drop))
                .join('line')
                .classed('lineSegment_drop', true)
                .attr('x1', padding_left)
                .attr('y1', d=>padding_top+scale(d['d1']))
                .attr('x2', padding_left+block_width)
                .attr('y2', d=>padding_top+scale(d['d2']))
                .attr('stroke', color_drop)
                .attr('id', d=>d['item'])
                .append('title')
                .text(d=>`${d.item}   Δ=${d['d2']-d['d1']}`)



            /* 两条竖线下面的 label */
            svg.append('g')
                .classed('series_label', true)
                .selectAll('text')
                .data(['2018','2019'])
                .join("text")
                .attr('x', (d,i)=>padding_left+block_width*i)
                .attr('y', padding_top+block_height+20)
                .style('font-size', '0.7em')
                .style("text-anchor", "middle")
                .text(d=>d)



            /****************/
            /* 画指着 target line items 的箭头 */

            /* 开始画 line segment 两端的箭头 */
            let arrow_color = {
                'A': '#d31cff',
                "B": '#00cb0a'
            }

            svg.append("defs")
                .append("marker")
                .attr("id",`arrow_marker_A`)
                .attr("markerUnits", 'strokeWidth')
                .attr("markerWidth", 12)
                .attr("markerHeight", 12)
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 10)
                .attr("refY", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M3.5,2 L10,6 L2,12 L6,6 L2,1")
                .style("fill", arrow_color['A'])


            svg.append("defs")
                .append("marker")
                .attr("id",`arrow_marker_B`)
                .attr("markerUnits", 'strokeWidth')
                .attr("markerWidth", 12)
                .attr("markerHeight", 12)
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 10)
                .attr("refY", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M3.5,2 L10,6 L2,12 L6,6 L2,1")
                .style("fill", arrow_color['B'])




            let targets = item_pairs[src.split('/')[1]]

            /* [ [x1, y1, x2, y2], [x1, y1, x2, y2] ] */
            let target_A_0 = ['A', document.getElementById(targets[0]).getAttribute('class'), Number(document.getElementById(targets[0]).getAttribute('x1')), Number(document.getElementById(targets[0]).getAttribute('y1'))]
            let target_B_0 = ['B', document.getElementById(targets[1]).getAttribute('class'), Number(document.getElementById(targets[1]).getAttribute('x1')), Number(document.getElementById(targets[1]).getAttribute('y1'))]
            let target_A_1 = ['A', document.getElementById(targets[0]).getAttribute('class'), Number(document.getElementById(targets[0]).getAttribute('x2')), Number(document.getElementById(targets[0]).getAttribute('y2'))]
            let target_B_1 = ['B', document.getElementById(targets[1]).getAttribute('class'), Number(document.getElementById(targets[1]).getAttribute('x2')), Number(document.getElementById(targets[1]).getAttribute('y2'))]


            let arrow_line = 20
            let A = target_A_0[1]=='lineSegment_rise'?
                Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2])):
                Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2])) /* 害 */
            let B = target_B_0[1]=='lineSegment_rise'?
                Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2])):
                Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2]))

            // console.log(A, B)

            svg.selectAll('.targets_A')
                .data([target_A_0,  target_A_1])
                .join('line')
                .classed('targets_A', true)
                // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                .attr('x1', (d,i)=>d[1]=='lineSegment_rise'?
                    (i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))):
                    (i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))))
                .attr('y1', (d,i)=>d[1]=='lineSegment_rise'?
                    (i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A)))):
                    (i<1?(d[3]+arrow_line*Math.sin(Math.abs(A))):(d[3]-arrow_line*Math.sin(Math.abs(A)))))
                .attr('x2', (d,i)=>d[2])
                .attr('y2', (d,i)=>d[3])
                .attr('stroke', arrow_color['A'])
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', d=>`url(#arrow_marker_A)`)


            svg.selectAll('.targets_B')
                .data([target_B_0, target_B_1])
                .join('line')
                .classed('targets_B', true)
                // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                // .attr('x1', (d,i)=>B>=0?d[2]+arrow_line*Math.cos(Math.abs(B)): d[2]-arrow_line*Math.cos(Math.abs(B)))
                .attr('x1', (d,i)=>d[1]=='lineSegment_rise'?
                    (i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))):
                    (i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))))
                .attr('y1', (d,i)=>d[1]=='lineSegment_rise'?
                    (i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B)))):
                    (i<1?(d[3]+arrow_line*Math.sin(Math.abs(B))):(d[3]-arrow_line*Math.sin(Math.abs(B)))))
                .attr('x2', (d,i)=>d[2])
                .attr('y2', (d,i)=>d[3])
                .attr('stroke', arrow_color['B'])
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', d=>`url(#arrow_marker_B)`)



        })

}


export default slopechart_build