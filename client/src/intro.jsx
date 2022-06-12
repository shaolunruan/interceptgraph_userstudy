import React, {Component} from 'react'
import {Carousel, Button, Form, Radio, Space, Modal, Input} from 'antd';

import './App.css'
import ReactDOM from "react-dom/client";
import * as d3 from "d3";

import Caution from "./caution";
import Results from "./result";

import interceptgraph_build2 from "./function/interceptgraph_4_tutorial";


import slopechart_img from './asset/20608135626.png'
import slopechart_img_minitest from './asset/20608161912.png'
import slopechart_img_minitest2 from './asset/11009.png'
import slopechart_img_minitest3 from './asset/211900.png'
import interceptgraph_img_intro from './asset/220612104004.png'





class Intro extends Component {

    constructor(props){
        super(props);
        this.state = {
            choiceSG_1: 0,
            choiceSG_2: 0,
            choiceIG_1: 0,
            choiceIG_2: 0,
            isModalVisible: true,


        }

        this.next = this.next.bind(this)
        this.next_text = this.next_text.bind(this)
        this.prev = this.prev.bind(this)
        this.failed = this.failed.bind(this)
        this.handle_closeModal = this.handle_closeModal.bind(this)



    }

    handle_choiceIG_1=(e)=>{
        let choiceIG_1 = e.target.value

        this.setState({
            choiceIG_1: +choiceIG_1
        })
    }



    handle_choiceIG_2=(e)=>{
        let choiceIG_2 = e.target.value

        this.setState({
            choiceIG_2: +choiceIG_2
        })
    }

    handle_choiceSG_1=(e)=>{
        let choiceSG_1 = e.target.value

        this.setState({
            choiceSG_1: +choiceSG_1
        })

    }

    handle_choiceSG_2=(e)=>{
        let choiceSG_2 = e.target.value

        this.setState({
            choiceSG_2: +choiceSG_2
        })

    }


    next(){


        this.refs.carousel.next()

    }

    next_IG_2=()=>{


        if((this.state.choiceIG_2)){
            this.failed()
            return
        }

        this.refs.carousel.next()

    }


    next_SG=()=>{

        /*B 过*/
        if(!(this.state.choiceSG_1)){
            this.failed()
            return
        }


        this.refs.carousel.next()

    }

    next_test=()=>{


        this.refs.carousel.next()

        interceptgraph_build2('#minitest_container', 'Datasets/tutorial.csv')


    }
    next_text(){
        /*B 过*/
        if(!(this.state.choiceIG)){
            this.failed()
            return
        }

        d3.select('#minitest_container').remove()


        interceptgraph_build2('#minitest2_container2', 'Datasets/tutorial2.csv')



        this.refs.carousel.next()
    }



    next_test2=()=>{

        /*B 过*/
        if(!(this.state.choiceIG_1)){
            this.failed()
            return
        }

        d3.select('#minitest2_container2').remove()


        interceptgraph_build2('#minitest3_container3', 'Datasets/tutorial3.csv')

        this.refs.carousel.next()

    }




    prev(){

        this.refs.carousel.prev();
    }

    failed(){

        d3.selectAll('#carousel_container').selectAll('*').remove()
        d3.select('#carousel_container').style('display', 'none')




        /*渲染 Results 组件*/
        this.results.render(<Results status=''/>)
    }

    start_testing=()=>{


        /*B 过*/
        if(!this.state.choiceSG_2){
            this.failed()
            return
        }

        d3.select('.intro_contents').selectAll('*').remove()
        this.caution.render(<Caution handle_render_test={this.handle_render_test}/>)


    }


    handle_closeModal(){



        let user_id = document.getElementById('user_id_input').value
        let this_ = this

        if(!user_id){
            alert('Please input a valid Prolific ID')

            this.failed()
        }


        new Promise((resolve, reject)=>{

            this.set_user_id(`${user_id}_${Date.now()}`)

            resolve()
        })
            .then(function(){
                console.log(`Set user_id ${user_id}`)

                this_.setState({
                    isModalVisible: false,
                })

            })



    }


    draw_graph=()=>{
        let svg = d3.select('#minitest_container')

        svg.append('line')
            .attr('x1', 0)
            .attr('x1', 0)
            .attr('x1', 0)
            .attr('x1', 0)
    }


    componentDidMount(){

        this.set_user_id = this.props.set_user_id
        this.results = ReactDOM.createRoot(document.getElementById('results_container'))
        this.caution = ReactDOM.createRoot(document.getElementById('caution_container'))


    }


    render(){



        this.handle_render_test = this.props.handle_render_test



        return(

            <>

                <div className="intro_contents">
                    <Modal title="Basic Modal" visible={this.state.isModalVisible} onOk={this.handle_closeModal}  maskClosable={false} closable={false} cancelButtonProps={{ style: { display: 'none' } }}>
                        <p>Please provide your Prolific ID:</p>
                        <Input id='user_id_input'/>
                    </Modal>


                    <div id="carousel_container">

                        <Carousel  ref='carousel'>
                            <div>
                                <div id="slide">
                                    <img src={interceptgraph_img_intro} alt="{slopechart_img}" />

                                    <p>
                                        A simple <span style={{'fontWeight': 'bold'}}>intercept graph</span> is shown above, where each line segment (data item) is drawn from the inner circular axis (initial state) to the outer circular axis (final state). The "difference" can be represented by the length of each line segment. Also, please note that the intercept graph differentiate the rising data items (i.e., from a small initial value to a large final value) from dropping data items (i.e., from a large initial value to a small final value). <span style={{'fontWeight': 'bold'}}>Specifically, the right half and the left half of the intercept graph are used to visualize rising and dropping data items, respectively</span>.
                                        <br/>
                                        <br/>
                                        For example, line segment AC indicates a data item with the initial value (i.e., 22) and the final value (i.e., 5.5). Its difference (22-5.5=16.5) can be indicated as line segment AB, <span style={{'fontWeight': 'bold'}}>which has been mathematically proved to be correct by us (you can assume it always holds now)</span>. Similarly, the difference of the data item DF can be indicated by DE. <span style={{'fontWeight': 'bold'}}>The difference of data item DF is larger than that of AC because the length of DE is larger than AB</span>.
                                    </p>



                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.next} >Next</Button>
                                    </Radio.Group>

                                </div>

                            </div>
                            <div>
                                <div id="slide">

                                    <iframe src="https://player.vimeo.com/video/718220632?h=00f3a2e77a&autoplay=0&loop=1"
                                            width="900" height="500" frameBorder="0"
                                            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>

                                    <p>

                                        <br/>
                                        <br/>
                                        <br/>
                                        To compare the difference of two line segments, <span style={{'textDecoration': 'underline' }}>simply clicking and dragging the inner area of the inner axis to make the relationship of the length of the two intercepted line segments more clear for identification (the line segment parts in the dark color)</span>, as shown in the video.
                                    </p>


                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.next_test} >Next</Button>
                                    </Radio.Group>

                                </div>
                            </div>
                            <div>

                                <div id="slide">
                                    <h1>Mini-test 1 (Intercept graph)</h1>
                                    <svg id="minitest_container" width={'820px'} height={'600px'}></svg>


                                    <p>
                                        Which data item has a larger difference?

                                        <br/>
                                        <span style={{'textDecoration': 'underline' }}>(Just drag the inner axis from the inner area and compare the highlighted length)</span>
                                    </p>





                                    <Radio.Group buttonStyle="solid" className={'group'} onChange={this.handle_choiceIG_1} value={this.state.choiceIG_1}>
                                        <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>
                                        <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>
                                    </Radio.Group>


                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.next_test2} >Next</Button>
                                    </Radio.Group>

                                </div>
                            </div>
                            {/* <div>

                            <div id="slide">
                                <h1>Mini-test 2 (Intercept graph)</h1>
                                <svg id="minitest2_container2" width={'820px'} height={'600px'}></svg>


                                <p>
                                    Which data item has a larger difference?

                                    <br/>
                                    <span style={{'textDecoration': 'underline' }}>(Just drag the inner axis from the inner area and compare the highlighted length)</span>
                                </p>





                                <Radio.Group buttonStyle="solid" className={'group'} onChange={this.handle_choiceIG} value={this.state.choiceIG}>
                                    <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>
                                    <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>
                                </Radio.Group>


                                <Radio.Group className='next_button' size={'middle'}>
                                    <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                    <Space/>
                                    <Button type="primary" onClick={this.next_test2} >Next</Button>
                                </Radio.Group>

                            </div>
                        </div>*/}
                            <div>

                                <div id="slide">
                                    <h1>Mini-test 2 (Intercept graph)</h1>
                                    <svg id="minitest3_container3" width={'820px'} height={'600px'}></svg>


                                    <p>
                                        Which data item has a larger difference?

                                        <br/>
                                        <span style={{'textDecoration': 'underline' }}>(Just drag the inner axis from the inner area and compare the highlighted length)</span>
                                    </p>





                                    <Radio.Group buttonStyle="solid" className={'group'} onChange={this.handle_choiceIG_2} value={this.state.choiceIG_2}>
                                        <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>
                                        <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>
                                    </Radio.Group>


                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.next_IG_2} >Next</Button>
                                    </Radio.Group>

                                </div>
                            </div>
                            <div>
                                <div id="slide">
                                    <img src={slopechart_img} alt="{slopechart_img}" />

                                    <p>
                                        A simple <span style={{'fontWeight': 'bold'}}>slope graph</span> is shown above, where each line segment represents a data item, with its initial and final values indicated by the two end points of the line segment. The "difference" can be represented by the line slopes. Please note that the <span style={{'color':'#1c5679'}}>blue</span> and <span style={{'color':'#962425'}}>red</span> line segments are used to visualize rising and dropping data items, respectively.
                                    </p>

                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.next} >Next</Button>
                                    </Radio.Group>

                                </div>

                            </div>
                            <div>
                                <div id="slide">

                                    <h1>Mini-test 1 (Slope graph)</h1>
                                    <img src={slopechart_img_minitest2} alt="{slopechart_img_minitest}" />

                                    <p>
                                        Which data item has a larger difference?
                                    </p>
                                    <Radio.Group buttonStyle="solid" className={'options'}  onChange={this.handle_choiceSG_1} value={this.state.choiceSG_1}>
                                        <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>
                                        <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>
                                    </Radio.Group>


                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.next_SG} >next</Button>
                                    </Radio.Group>

                                    {/*<Button type="primary" onClick={this.failed} >Commence Tests!</Button>*/}


                                </div>

                            </div>
                            {/*<div>*/}
                            {/*    <div id="slide">*/}

                            {/*        <h1>Mini-test 2 (Slope graph)</h1>*/}
                            {/*        <img src={slopechart_img_minitest2} alt="{slopechart_img_minitest}" />*/}

                            {/*        <p>*/}
                            {/*            Which data item has a larger difference?*/}
                            {/*        </p>*/}
                            {/*        <Radio.Group buttonStyle="solid" className={'options'}  onChange={this.handle_choiceSG} value={this.state.choiceSG}>*/}
                            {/*            <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>*/}
                            {/*            <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>*/}
                            {/*        </Radio.Group>*/}


                            {/*        <Radio.Group className='next_button' size={'middle'}>*/}
                            {/*            <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>*/}
                            {/*            <Space/>*/}
                            {/*            <Button type="primary" onClick={this.next_SG} >next</Button>*/}
                            {/*        </Radio.Group>*/}

                            {/*        <Button type="primary" onClick={this.failed} >Commence Tests!</Button>*/}


                            {/*    </div>*/}

                            {/*</div>*/}
                            <div>
                                <div id="slide">

                                    <h1>Mini-test 2 (Slope graph)</h1>
                                    <img src={slopechart_img_minitest3} alt="{slopechart_img_minitest}" />

                                    <p>
                                        Which data item has a larger difference (absolute value for negative difference)?
                                    </p>
                                    <Radio.Group buttonStyle="solid" className={'options'}  onChange={this.handle_choiceSG_2} value={this.state.choiceSG_2}>
                                        <Radio.Button value={0} style={{background: "#d31cff"}}></Radio.Button>
                                        <Radio.Button value={1} style={{background: "#00cb0a"}}></Radio.Button>
                                    </Radio.Group>


                                    <Radio.Group className='next_button' size={'middle'}>
                                        <Button type="primary" onClick={this.prev}  style={{'marginRight': '10px'}}>Previous</Button>
                                        <Space/>
                                        <Button type="primary" onClick={this.start_testing} >Confirm and Continue!</Button>
                                    </Radio.Group>

                                    {/*<Button type="primary" onClick={this.failed} >Commence Tests!</Button>*/}


                                </div>

                            </div>
                        </Carousel>

                    </div>

                </div>

                <div id="caution_container"></div>



                <div id="results_container"></div>
            </>


    )
    }
}

export default Intro;