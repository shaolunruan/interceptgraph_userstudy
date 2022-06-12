import * as d3 from 'd3'

import {axisRadialInner, axisRadialOuter} from "./radial-axis";
import item_pairs from '../configuration/item_pairs'
import axios from "axios";




const interceptgraph_build = (svg_id, src) =>{

    /*如果 dom_id 没有的话，报错*/
    if (d3.select(`${svg_id}`).size()==0){
        console.log("'svg_id' not found")
        return
    }

    const svg = d3.select(`${svg_id}`)

    /*width height 为 svg 画布的长宽，cx cy是画布的中心, r 是 IG 半径（默认0.8倍的 cx或cy）*/
    const [width] = svg.attr('width').match(/\d+/g) || ['600'], [height] = svg.attr('height').match(/\d+/g) || ['600']
    /*IG 的中心*/
    const cx = width/2, cy = height/2
    const r = d3.min([cx, cy]) * 0.8


    axios.get(src)
        .then(data__=> {

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




            /*开始计算 对上升和下降的 extent*/
            let extent_rise = d3.extent(Object.values(data_rise).map(d=>d['d1']).concat(Object.values(data_rise).map(d=>d['d2'])))
            let extent_drop = d3.extent(Object.values(data_drop).map(d=>d['d1']).concat(Object.values(data_drop).map(d=>d['d2'])))


            /* 计算内圆半径的公式 */
            function innerAxis_cal(obj, axis_scale, outerAxisRadius){

                return outerAxisRadius/2 || 200

                let arr = Object.values(obj)
                let n = arr.length
                let inner_n = d3.min([Math.floor(Math.pow(n, 2/3)), n])

                /* 如果一侧没有数据 */
                if(n==0){
                    // console.log('No half component detected')
                    return 0
                }

                let arr_sort
                if(arr[0]['d2']-arr[0]['d1']>=0){
                    // console.log('filtered rise:', `${inner_n}/${n}`)
                    arr_sort = arr.sort(function(a,b){
                        return (a['d1']-a['d2'])-(b['d1']-b['d2'])
                    })

                }
                else{
                    // console.log("filtered drop:", `${inner_n}/${n}`)
                    arr_sort = arr.sort(function(a,b){
                        return (b['d1']-b['d2'])-(a['d1']-a['d2'])
                    })

                }


                let thresh_item = arr_sort[inner_n] || arr_sort[0]/*取最小值是因为 防止+1之后超出arr的最大索引*/

                let innerAxisRadius = outerAxisRadius * Math.cos(axis_scale(thresh_item['d1'])-axis_scale(thresh_item['d2']))
                innerAxisRadius=innerAxisRadius>0?innerAxisRadius:0.5*outerAxisRadius


                return innerAxisRadius
            }





            /***********开始画图**********/
            const color_rise = '#0d597e', color_drop = '#9d2325'



            let g = svg.append('g')
                .classed('interceptgraph_g', true)
                .attr('transform', `translate(${cx}, ${cy})`)



            /*开始创建 scale 环形坐标轴 上升*/
            let axisScale_rise = d3.scaleLinear()
                .domain(extent_rise)
                .range([Math.PI, 0]);


            let outerAxisRadius_rise = r;
            let innerAxisRadius_rise = innerAxis_cal(data_rise, axisScale_rise, outerAxisRadius_rise)



            let outerAxis_rise = axisRadialOuter(axisScale_rise, outerAxisRadius_rise);
            let innerAxis_rise = axisRadialOuter(axisScale_rise, innerAxisRadius_rise);




            /*开始创建 scale 环形坐标轴 下降*/
            let axisScale_drop = d3.scaleLinear()
                .domain(extent_drop)
                .range([Math.PI, 2 * Math.PI]);


            let outerAxisRadius_drop = r;
            let innerAxisRadius_drop = innerAxis_cal(data_drop, axisScale_drop, outerAxisRadius_drop)




            let outerAxis_drop = axisRadialOuter(axisScale_drop, outerAxisRadius_drop);
            let innerAxis_drop = axisRadialOuter(axisScale_drop, innerAxisRadius_drop);




            /*生成DOM，但是是invisible， 用来抽取每个tick的坐标，来画放射虚线，*/
            g.append('g').classed('outerAxis_rise_', true).call(outerAxis_rise.ticks(10));
            g.append('g').classed('outerAxis_drop_', true).call(outerAxis_drop.ticks(10));

            g.append('g').classed('innerAxis_rise_', true).call(innerAxis_rise.ticks(10));
            g.append('g').classed('innerAxis_drop_', true).call(innerAxis_drop.ticks(10));


            /*根据scale，画放射的 用来对齐 的虚线*/
            let tickArray_rise = [], tickArray_drop = []
            /*抽取 rise 的 axis上所有tick*/
            d3.selectAll('.outerAxis_rise_>.tick').each(function(){
                let [_, x, y] = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))
                tickArray_rise.push([+x,+y])
            })

            /*抽取 drop 的 axis上所有tick*/
            d3.selectAll('.outerAxis_drop_>.tick').each(function(){
                let [_, x, y] = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))
                tickArray_drop.push([+x,+y])
            })



            /*开始画 放射的虚线*/
            g.selectAll('.dottedLine')
                .data(tickArray_rise.concat(tickArray_drop))
                .join('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', d=>d[0])
                .attr('y2', d=>d[1])
                .attr('stroke', '#ababab')
                .attr('stroke-width', 0.7)
                .attr('stroke-dasharray', 4)



            /* 添加 dragging 交互 */
            let dragging = d3.drag()
                .on("start", dragged)
                .on("drag", dragged)
                .on("end", dragended);




            /*根据scale，画axis*/
            g.append('g').classed('outerAxis_rise', true).call(outerAxis_rise.ticks(10).tickSize(3));
            g.append('g').classed('outerAxis_drop', true).call(outerAxis_drop.ticks(10).tickSize(3));

            g.append('g').classed('innerAxis_rise', true).call(innerAxis_rise.ticks(10).tickSize(3)).call(dragging);
            g.append('g').classed('innerAxis_drop', true).call(innerAxis_drop.ticks(10).tickSize(3)).call(dragging);



            /**********TODO*********/
            /* 先算阈值difference */
            let arr1 = Object.values(data_rise)
            let n1 = arr1.length
            let inner_n1 = d3.min([Math.floor(Math.pow(n1, 2/3)), n1])

            let threshold1, threshold2
            let thresh_difference1, thresh_difference2
            let arr_sort1, arr_sort2

            /* 如果一侧没有数据 */
            if(n1==0){
                // console.log('No half component detected')
                thresh_difference1 = 999
            }else{

                // console.log('filtered rise:', `${inner_n}/${n}`)
                arr_sort1 = arr1.sort(function(a,b){
                    return (a['d1']-a['d2'])-(b['d1']-b['d2'])
                })

                threshold1 = arr_sort1[inner_n1] || arr_sort1[0]

                thresh_difference1 = threshold1['d2'] - threshold1['d1'] || 999/*取最小值是因为 防止+1之后超出arr的最大索引*/

            }


            /* 先算阈值difference */
            let arr2 = Object.values(data_drop)
            let n2 = arr2.length
            let inner_n2 = d3.min([Math.floor(Math.pow(n2, 2/3)), n2])

            /* 如果一侧没有数据 */
            if(n2==0){
                // console.log('No half component detected')
                thresh_difference2 = 999
            }else{

                // console.log('filtered rise:', `${inner_n}/${n}`)
                arr_sort2 = arr2.sort(function(a,b){
                    return (b['d1']-b['d2'])-(a['d1']-a['d2'])
                })

                threshold2 = arr_sort2[inner_n2] || arr_sort2[0]

                thresh_difference2 = Math.abs(threshold2['d2'] - threshold2['d1']) || 999/*取最小值是因为 防止+1之后超出arr的最大索引*/
            }



            let intensity_arr1 = []
            let intensity_arr2 = []

            // console.log(thresh_difference1, thresh_difference2)
            /**********TODO*********/



            /* 开始画 line segment */
            /* 上升 */
            g.selectAll('.intercept_rise')
                .data(Object.values(data_rise))
                .join('line')
                .classed('intercept_rise', true)
                .attr('x1', d=>innerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d1'])))
                .attr('y1', d=>innerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d1'])))
                .attr('x2', d=>outerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d2'])))
                .attr('y2', d=>outerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d2'])))
                .attr('id', d=>d['item'])
                .attr('stroke', color_rise)
                .attr('stroke-width', 1)
                .attr('opacity', 0.5)
                .append('title')
                .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)
                /* 从这里把 residue 筛选出来 */
                .each(function(d,i){
                    let difference = d['d2'] - d['d1']
                    if(difference>thresh_difference1){
                        // console.log(d)

                        intensity_arr1.push([outerAxisRadius_rise, innerAxisRadius_rise, axisScale_rise(d['d1'])-axisScale_rise(d['d2']), difference])
                    }

                })




            /* 下降 */
            g.selectAll('.intercept_drop')
                .data(Object.values(data_drop))
                .join('line')
                .classed('intercept_drop', true)
                .attr('x1', d=>innerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d1'])))
                .attr('y1', d=>innerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d1'])))
                .attr('x2', d=>outerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d2'])))
                .attr('y2', d=>outerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d2'])))
                .attr('id', d=>d['item'])
                .attr('stroke', color_drop)
                .attr('stroke-width', 1)
                .attr('opacity', 0.5)
                .append('title')
                .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)
                /* 从这里把 residue 筛选出来 */
                .each(function(d,i){
                    let difference = d['d2'] - d['d1']
                    if(Math.abs(difference)>thresh_difference2){

                        intensity_arr2.push([outerAxisRadius_drop, innerAxisRadius_drop, axisScale_drop(d['d1'])-axisScale_drop(d['d2']), difference])
                    }

                })

            // console.log(intensity_arr1, intensity_arr2)
            /* 计算intensity的ratio */



            /* fix tick label 重叠的问题 */
            d3.select(d3.selectAll('.outerAxis_rise>g>text').nodes()[0]).attr('dx', 8)
            d3.select(d3.selectAll('.outerAxis_drop>g>text').nodes()[0]).attr('dx', -8)
            d3.select(d3.selectAll('.outerAxis_rise>g>text').nodes()[d3.selectAll('.outerAxis_rise>g>text').size()-1]).attr('dx', 8)
            d3.select(d3.selectAll('.outerAxis_drop>g>text').nodes()[d3.selectAll('.outerAxis_drop>g>text').size()-1]).attr('dx', -8)




            /*开始画 clip 和 residue-items*/
            g.append('defs')
                .append('clipPath')
                .attr('id', 'clip_rise')
                .append('circle')
                .attr('r', innerAxisRadius_rise)

            g.append('defs')
                .append('clipPath')
                .attr('id', 'clip_drop')
                .append('circle')
                .attr('r', innerAxisRadius_drop)




            /* 上升 */
            g.selectAll('.intercept_rise_residue')
                .data(Object.values(data_rise))
                .join('line')
                .classed('intercept_rise_residue', true)
                .attr('x1', d=>innerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d1'])))
                .attr('y1', d=>innerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d1'])))
                .attr('x2', d=>outerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d2'])))
                .attr('y2', d=>outerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d2'])))
                .attr('stroke', color_rise)
                .attr('stroke-width', 1)
                .attr('clip-path', `url(#clip_rise`)
                .append('title')
                .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)



            /* 下降 */
            g.selectAll('.intercept_drop_residue')
                .data(Object.values(data_drop))
                .join('line')
                .classed('intercept_drop_residue', true)
                .attr('x1', d=>innerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d1'])))
                .attr('y1', d=>innerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d1'])))
                .attr('x2', d=>outerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d2'])))
                .attr('y2', d=>outerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d2'])))
                .attr('stroke', color_drop)
                .attr('stroke-width', 1)
                .attr('clip-path', `url(#clip_drop`)
                .append('title')
                .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)



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


            let arrow_line = 25
            let A = target_A_0[1]=='intercept_rise'?
                (target_A_0[2]<target_A_1[2]?Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2])):Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2]))-Math.PI):
                (Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2]))) /* 害 */
            let B = target_B_0[1]=='intercept_rise'?
                (target_B_0[2]<target_B_1[2]?Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2])):Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2]))-Math.PI):
                (Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2])))

            // console.log(A, B)

            g.selectAll('.targets_A')
                .data([target_A_0,  target_A_1])
                .join('line')
                .classed('targets_A', true)
                // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                .attr('x1', (d,i)=>d[1]=='intercept_rise'?
                    (A>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))):(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A))))):
                    (A>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))):(i<1?(d[2]+arrow_line*Math.cos(Math.abs(A))):(d[2]-arrow_line*Math.cos(Math.abs(A))))))
                .attr('y1', (d,i)=>d[1]=='intercept_rise'?
                    (A>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A)))):(i<1?(d[3]+arrow_line*Math.sin(Math.abs(A))):(d[3]-arrow_line*Math.sin(Math.abs(A))))):
                    (A>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A)))):(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A))))))
                .attr('x2', (d,i)=>d[2])
                .attr('y2', (d,i)=>d[3])
                .attr('stroke', arrow_color['A'])
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', d=>`url(#arrow_marker_A)`)


            g.selectAll('.targets_B')
                .data([target_B_0, target_B_1])
                .join('line')
                .classed('targets_B', true)
                // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                // .attr('x1', (d,i)=>B>=0?d[2]+arrow_line*Math.cos(Math.abs(B)): d[2]-arrow_line*Math.cos(Math.abs(B)))
                .attr('x1', (d,i)=>d[1]=='intercept_rise'?
                    (B>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))):(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B))))):
                    (B>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))):(i<1?(d[2]+arrow_line*Math.cos(Math.abs(B))):(d[2]-arrow_line*Math.cos(Math.abs(B))))))
                .attr('y1', (d,i)=>d[1]=='intercept_rise'?
                    (B>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B)))):(i<1?(d[3]+arrow_line*Math.sin(Math.abs(B))):(d[3]-arrow_line*Math.sin(Math.abs(B))))):
                    (B>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B)))):(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B))))))
                .attr('x2', (d,i)=>d[2])
                .attr('y2', (d,i)=>d[3])
                .attr('stroke', arrow_color['B'])
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', d=>`url(#arrow_marker_B)`)







            /* 做 inner axis 的交互 */
            function dragstarted(event){

                /* 融合到dragged */
            }



            function dragged(event){
                let x = event.x, y = event.y
                let r_ = d3.min([Math.sqrt(x*x+y*y), r])
                let className = d3.select(this).attr('class')



                /* 如果drag的是rise（右半部分） */
                if(className.split('_')[1]=='rise'){
                    /* 更新 inner axis */
                    d3.select(`.${className}`).remove()
                    let innerAxis_rise = axisRadialOuter(axisScale_rise, r_);
                    g.append('g').classed('innerAxis_rise', true).call(innerAxis_rise.ticks(10).tickSize(3)).call(dragging);


                    /* 更新 line segments */
                    d3.selectAll('.intercept_rise').remove()

                    g.selectAll('.intercept_rise')
                        .data(Object.values(data_rise))
                        .join('line')
                        .classed('intercept_rise', true)
                        .attr('x1', d=>r_ * Math.sin(Math.PI - axisScale_rise(d['d1'])))
                        .attr('y1', d=>r_ * Math.cos(Math.PI - axisScale_rise(d['d1'])))
                        .attr('x2', d=>outerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d2'])))
                        .attr('y2', d=>outerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d2'])))
                        .attr('id', d=>d['item'])
                        .attr('stroke', color_rise)
                        .attr('stroke-width', 1)
                        .attr('opacity', 0.5)
                        .append('title')
                        .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)


                    /* 更新 residue-item 线段*/
                    d3.select('#clip_rise')
                        .select('circle')
                        .attr('r', r_)

                    g.selectAll('.intercept_rise_residue')
                        .data(Object.values(data_rise))
                        .join('line')
                        .classed('intercept_rise_residue', true)
                        .attr('x1', d=>r_ * Math.sin(Math.PI - axisScale_rise(d['d1'])))
                        .attr('y1', d=>r_ * Math.cos(Math.PI - axisScale_rise(d['d1'])))
                        .attr('x2', d=>outerAxisRadius_rise * Math.sin(Math.PI - axisScale_rise(d['d2'])))
                        .attr('y2', d=>outerAxisRadius_rise * Math.cos(Math.PI - axisScale_rise(d['d2'])))
                        .attr('stroke', color_rise)
                        .attr('stroke-width', 1)
                        .attr('clip-path', `url(#clip_rise`)
                        .append('title')
                        .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)


                }
                /* 如果drag的是drop（左半部分） */
                else{

                    console.log('inner')
                    /* 更新 inner axis */
                    d3.select(`.${className}`).remove()
                    let innerAxis_drop = axisRadialOuter(axisScale_drop, r_);
                    g.append('g').classed('innerAxis_drop', true).call(innerAxis_drop.ticks(10).tickSize(3)).call(dragging);


                    /* 更新 line segments */
                    d3.selectAll('.intercept_drop').remove()

                    g.selectAll('.intercept_drop')
                        .data(Object.values(data_drop))
                        .join('line')
                        .classed('intercept_drop', true)
                        .attr('x1', d=>r_ * Math.sin(Math.PI - axisScale_drop(d['d1'])))
                        .attr('y1', d=>r_ * Math.cos(Math.PI - axisScale_drop(d['d1'])))
                        .attr('x2', d=>outerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d2'])))
                        .attr('y2', d=>outerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d2'])))
                        .attr('id', d=>d['item'])
                        .attr('stroke', color_drop)
                        .attr('stroke-width', 1)
                        .attr('opacity', 0.5)
                        .append('title')
                        .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)


                    /* 更新 residue-item 线段*/
                    d3.select('#clip_drop')
                        .select('circle')
                        .attr('r', r_)

                    g.selectAll('.intercept_drop_residue')
                        .data(Object.values(data_drop))
                        .join('line')
                        .classed('intercept_drop_residue', true)
                        .attr('x1', d=>r_ * Math.sin(Math.PI - axisScale_drop(d['d1'])))
                        .attr('y1', d=>r_ * Math.cos(Math.PI - axisScale_drop(d['d1'])))
                        .attr('x2', d=>outerAxisRadius_drop * Math.sin(Math.PI - axisScale_drop(d['d2'])))
                        .attr('y2', d=>outerAxisRadius_drop * Math.cos(Math.PI - axisScale_drop(d['d2'])))
                        .attr('stroke', color_drop)
                        .attr('stroke-width', 1)
                        .attr('clip-path', `url(#clip_drop`)
                        .append('title')
                        .text(d=>`${d.item}   Δ=${(d['d2']-d['d1']).toFixed(2)}`)

                }

                /* 更新 arrow部分 */

                /*清除之前的*/
                d3.selectAll('.targets_A,.targets_B').remove()


                let targets = item_pairs[src.split('/')[1]]

                /* [ [x1, y1, x2, y2], [x1, y1, x2, y2] ] */
                let target_A_0 = ['A', document.getElementById(targets[0]).getAttribute('class'), Number(document.getElementById(targets[0]).getAttribute('x1')), Number(document.getElementById(targets[0]).getAttribute('y1'))]
                let target_B_0 = ['B', document.getElementById(targets[1]).getAttribute('class'), Number(document.getElementById(targets[1]).getAttribute('x1')), Number(document.getElementById(targets[1]).getAttribute('y1'))]
                let target_A_1 = ['A', document.getElementById(targets[0]).getAttribute('class'), Number(document.getElementById(targets[0]).getAttribute('x2')), Number(document.getElementById(targets[0]).getAttribute('y2'))]
                let target_B_1 = ['B', document.getElementById(targets[1]).getAttribute('class'), Number(document.getElementById(targets[1]).getAttribute('x2')), Number(document.getElementById(targets[1]).getAttribute('y2'))]


                let A = target_A_0[1]=='intercept_rise'?
                    (target_A_0[2]<target_A_1[2]?Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2])):Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2]))-Math.PI):
                    (Math.atan((target_A_1[3] - target_A_0[3]) / (target_A_1[2] - target_A_0[2]))) /* 害 */
                let B = target_B_0[1]=='intercept_rise'?
                    (target_B_0[2]<target_B_1[2]?Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2])):Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2]))-Math.PI):
                    (Math.atan((target_B_1[3] - target_B_0[3]) / (target_B_1[2] - target_B_0[2])))



                g.selectAll('.targets_A')
                    .data([target_A_0,  target_A_1])
                    .join('line')
                    .classed('targets_A', true)
                    // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                    // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                    // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                    // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                    .attr('x1', (d,i)=>d[1]=='intercept_rise'?
                        (A>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))):(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A))))):
                        (A>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(A))):(d[2]+arrow_line*Math.cos(Math.abs(A)))):(i<1?(d[2]+arrow_line*Math.cos(Math.abs(A))):(d[2]-arrow_line*Math.cos(Math.abs(A))))))
                    .attr('y1', (d,i)=>d[1]=='intercept_rise'?
                        (A>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A)))):(i<1?(d[3]+arrow_line*Math.sin(Math.abs(A))):(d[3]-arrow_line*Math.sin(Math.abs(A))))):
                        (A>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A)))):(i<1?(d[3]-arrow_line*Math.sin(Math.abs(A))):(d[3]+arrow_line*Math.sin(Math.abs(A))))))
                    .attr('x2', (d,i)=>d[2])
                    .attr('y2', (d,i)=>d[3])
                    .attr('stroke', arrow_color['A'])
                    .attr('stroke-width', 2)
                    .attr('stroke-linecap', 'round')
                    .attr('marker-end', d=>`url(#arrow_marker_A)`)


                g.selectAll('.targets_B')
                    .data([target_B_0, target_B_1])
                    .join('line')
                    .classed('targets_B', true)
                    // .attr('x1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+25:d[2]):i<=1?d[2]-25:d[2])
                    // .attr('y1', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-25:i<=1?d[3]:d[3]+25)
                    // .attr('x2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[2]+10:d[2]):i<=1?d[2]-10:d[2])
                    // .attr('y2', (d,i)=>d[1]=='intercept_rise'?(i<=1?d[3]:d[3])-10:(i<=1?d[3]:d[3]+10))
                    // .attr('x1', (d,i)=>B>=0?d[2]+arrow_line*Math.cos(Math.abs(B)): d[2]-arrow_line*Math.cos(Math.abs(B)))
                    .attr('x1', (d,i)=>d[1]=='intercept_rise'?
                        (B>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))):(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B))))):
                        (B>=0?(i<1?(d[2]-arrow_line*Math.cos(Math.abs(B))):(d[2]+arrow_line*Math.cos(Math.abs(B)))):(i<1?(d[2]+arrow_line*Math.cos(Math.abs(B))):(d[2]-arrow_line*Math.cos(Math.abs(B))))))
                    .attr('y1', (d,i)=>d[1]=='intercept_rise'?
                        (B>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B)))):(i<1?(d[3]+arrow_line*Math.sin(Math.abs(B))):(d[3]-arrow_line*Math.sin(Math.abs(B))))):
                        (B>=0?(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B)))):(i<1?(d[3]-arrow_line*Math.sin(Math.abs(B))):(d[3]+arrow_line*Math.sin(Math.abs(B))))))
                    .attr('x2', (d,i)=>d[2])
                    .attr('y2', (d,i)=>d[3])
                    .attr('stroke', arrow_color['B'])
                    .attr('stroke-width', 2)
                    .attr('stroke-linecap', 'round')
                    .attr('marker-end', d=>`url(#arrow_marker_B)`)




            }

            function dragended(event){
                // console.log(d3.select(this).node())


            }










        })







}

export default interceptgraph_build;