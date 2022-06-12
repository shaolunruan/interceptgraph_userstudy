import React, {Component} from 'react'
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { Button, Radio, Form, Progress, Modal  } from 'antd';
import * as d3 from 'd3'

import dataset_names from "./configuration/dataset_name";
import answers from "./configuration/answers";


import InterceptgraphPage from './Components/interceptgraph-page.jsx'
import SlopegraphPage from "./Components/slopegraph-page.jsx";

import Results from "./result";
import Questionnaire from "./questionnaire";





class Test extends Component {

    constructor(props){
        super(props);
        this.state = {
            choice: null,

        }

        this.handleNext = this.handleNext.bind(this)
        this.renderNewChart = this.renderNewChart.bind(this)
        this.postData = this.postData.bind(this)
        this.handle_choice = this.handle_choice.bind(this)
        this.calcDuration = this.calcDuration.bind(this)
        this.initChart = this.initChart.bind(this)
        this.draw = this.draw.bind(this)
        this.complete = this.complete.bind(this)

    }



    calcDuration(){
        if(!this.timeStamp){
            this.timeStamp = new Date().getTime()
        }else{
            let newTimeStamp = new Date().getTime()
            let duration = (newTimeStamp - this.timeStamp)/1000
            this.timeStamp = newTimeStamp


            return duration
        }
    }



    handleNext (){

        /* chartIndex 自增 1 */
/*        this.setState(prevState => {
            return {chartIndex: prevState.chartIndex + 1}
        })*/
        this.chartIndex += 1

        let duration = this.calcDuration() || 0
        let choice = this.state.choice || '0'


        this.postData(this.data, this.chart, choice, duration)

        if(this.chartIndex >=72){
            return
        }

        this.renderNewChart()


    }



    postData(data_name='0', chart_name='0', choice= '0', duration=0){


        // axios.post(`/api/`, {'chart_name': chart_name, 'data_name': data_name, 'choice': choice, "answer": answers[data_name], "duration": duration, "user_id": this.user_id})
        axios.post(`http://131.123.39.100:5000/api/`, {'chart_name': chart_name, 'data_name': data_name, 'choice': choice, "answer": answers[data_name], "duration": duration, "user_id": this.user_id})
            .then(res=>{
                let {choice, duration} = res['data']

                console.log({'chart_name': chart_name, 'data_name': data_name, 'choice': choice, "answer": answers[data_name], "duration": duration})
            })

        this.setState({
            choice: null
        })
    }


    renderNewChart(){
        this.block.unmount()

        let data_name = (dataset_names.concat(dataset_names))[+this.chartIndex]


        // this.draw('Datasets/1.csv')
        this.draw(`Datasets/${data_name}`)


    }

    draw(data_name){

        this.block = ReactDOM.createRoot(document.getElementById('interface'))


        this.chart = ''
        this.data = data_name.split('/')[1]


        /* 给用户分配 interceptgraph 还是 slopegraph (谁先谁后根据 randomSeed) */
        if(this.chartIndex<36==this.randomSeed){
            this.block.render(<InterceptgraphPage data_name={data_name}/>)
            this.chart = 'interceptgraph'

        }else{
            this.block.render(<SlopegraphPage data_name={data_name}/>)
            this.chart = 'slopegraph'

        }


    }




    handle_choice(e){
        let choice = e.target.value || '0'

        this.setState({
            choice: choice || '0'
        })
    }



    initChart(){


        let data_name = (dataset_names.concat(dataset_names))[+this.chartIndex]




        // this.draw('Datasets/1.csv')
        this.draw(`Datasets/${data_name}`)
        this.calcDuration()
    }



    complete(){

        d3.selectAll('.content').selectAll('*').remove()


        this.questionnaire = ReactDOM.createRoot(document.getElementById('questionnaire_container'))

        /*渲染 Results 组件*/
        this.questionnaire.render(<Questionnaire user_id={this.user_id}/>)
    }





    componentDidMount() {

        this.randomSeed = 0

        // axios.get(`/api/get_fileNumber`)
        axios.get(`http://131.123.39.100:5000/api/get_fileNumber`)
            .then(res=>{
                this.randomSeed = +res['data'] || 0

            })
            .then(()=>{
                this.chartIndex = 0

                this.user_id = this.props.user_id


                this.initChart()
            })




    }




    render(){


        return(
            <div>


                    <div className={'content'}>

                        {/* 装 chart 的容器 */}
                        <div id="interface"></div>

                        <div className="buttons">
                            {/*<Radio.Group value={} onChange={}>*/}
                            <Form.Item label={"Which data item has a larger difference?"}>
                                <Radio.Group buttonStyle="solid"  onChange={this.handle_choice} value={this.state.choice} disabled={(this.chartIndex)==72? true: false}>
                                    <Radio.Button value="0" style={{background: "#d31cff"}}>A</Radio.Button>
                                    <Radio.Button value="1" style={{background: "#00cb0a"}}>B</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label={""}>
                                <Button type="primary" onClick={this.handleNext} disabled={(this.chartIndex)==72 || this.state.choice===null? true: false}>Next One</Button>
                            </Form.Item>
                        </div>

                        {(this.chartIndex)==72?<Progress percent={100} />:<Progress className="progressBar" percent={(this.chartIndex/72*100 || 0).toFixed(2)} status="active" />}
                        {this.chartIndex==72?<Button type="primary" onClick={this.complete}>Complete!</Button>:null }
                    </div>
                    {/*null*/}
                {/*}*/}



                <div id="questionnaire_container"></div>



            </div>
        )
    }
}

export default Test;