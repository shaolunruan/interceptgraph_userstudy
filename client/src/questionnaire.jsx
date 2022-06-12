import React, {Component} from 'react'
import {Button, Form, Input } from 'antd';
import axios from 'axios'

import './App.css'

import Results from "./result";
import * as d3 from "d3";
import ReactDOM from "react-dom/client";




class Questionnaire extends Component {

    constructor(props){
        super(props);
        this.state = {

        }

        // this.next = this.next.bind(this)



    }

    onFinish=(values)=>{

        console.log(values);

        // axios.post(`/api/questionnaire`, {...values, 'user_id': this.user_id})
        axios.post(`http://131.123.39.100:5000/api/questionnaire`, {...values, 'user_id': this.user_id})
            .then(res=>{
                console.log('post success')
            })


        d3.selectAll('#questionnaire_content').selectAll('*').remove()
        this.results = ReactDOM.createRoot(document.getElementById('results_container'))
        /*渲染 Results 组件*/
        this.results.render(<Results status='pass'/>)
    }





    componentDidMount(){

        this.user_id = this.props.user_id

    }


    render(){


        const validateMessages = {
            required: 'This field is required!',
        }



        return(

            <>

                <div id="questionnaire_content">

                    <h1>Questionnaire</h1>

                    <Form style={{ width: "700px" }} onFinish={this.onFinish}  validateMessages={validateMessages}>
                        <Form.Item name='gender' label="Your gender:" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name='age' label="Your age:" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <span>Your visualization proficiency (No Knowledge/Passing Knowledge/Knowledgeable/Expert)</span>
                        <Form.Item name='vis_proficiency' label="" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <span>Do you think if it is effective to compare the data items’ differences by Intercept Graph? Please explain why.</span>
                        <Form.Item name='Q1' label="" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <span>Is Intercept Graph more suitable for comparing larger differences or small differences? Please explain why.</span>
                        <Form.Item name='Q2' label="" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <span>Do you think if it is easy and smooth to adjust the radius of the inner axis of Intercept Graph? Please provide more details.</span>
                        <Form.Item name='Q3' label="" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <span>Do you think if adjusting the inner axis radius is helpful for you to filter data differences of interest? Please explain why.</span>
                        <Form.Item name='Q4' label="" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <span>Compared with slope graphs (i.e., using line slopes), do you think if it is easier\effective to compare data differences using Intercept Graph (i.e., line segment length)? Please provide more details on the pros and cons of both visual designs.</span>
                        <Form.Item name='Q5' label="" rules={[{ required: true }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Complete Study!
                        </Button>
                    </Form>


                </div>



                <div id="results_container"></div>

            </>
        )
    }
}

export default Questionnaire;