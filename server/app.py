from flask import Flask, request, make_response
from flask_cors import CORS
import csv
import json
import uuid
import os, os.path




##
import geocoder


app = Flask(__name__)
CORS(app)


app.config['ENV'] = 'development' # 'production
app.config['DEBUG'] = True



@app.route('/api/', methods=['GET', 'POST'])
def main_func():
    if request.method == "POST":


        chart_name = request.get_json()['chart_name'] or '0'
        data_name = request.get_json()['data_name'] or '0'
        choice = int(request.get_json()['choice']) or 0
        answer = int(request.get_json()['answer']) or 0
        duration = float(request.get_json()['duration']) or 0

        user_id = request.get_json()['user_id'] or 'random_{}'.format(uuid.uuid4())

        # response = make_response("Setting a cookie")

        # response.delete_cookie('user_name')


        # if not request.cookies.get('user_name'):
        #     response.set_cookie('user_name', str(uuid.uuid4()), max_age=60 * 60 * 24 * 365 * 2)
        #
        # user_name = request.cookies.get('user_name') or datetime.now().strftime("%H-%M-%S")
        # print(user_name)

        ##
        # print(geocoder.ip('me').latlng)




        ##
        with open('data/{}.csv'.format(user_id), 'a+', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(
                [chart_name, data_name, choice, answer, duration]
            )
            f.close()


        return {
            'choice': choice,
            'duration': duration
        }

    return 'success'



@app.route('/api/questionnaire', methods=['GET', 'POST'])
def set_user_id():

    if request.method == "POST":


        answers = request.get_json()

        user_id = request.get_json()['user_id'] or 'random_{}'.format(uuid.uuid4())


        with open('data_questionnaire/{}.json'.format(user_id), "w") as outfile:
            json.dump(answers, outfile)
            outfile.close()


        return answers


    return 'success'




@app.route('/api/get_fileNumber', methods=['GET'])
def get_fileNumber():


    dir_path = 'data'
    file_number = len([entry for entry in os.listdir(dir_path)])

    randomSeed = 0

    if file_number%2 == 1:
        randomSeed = 1
    else:
        randomSeed = 0

    return str(randomSeed)



@app.route('/api/set_cookie', methods=['GET'])
def set_cookie():


    response = make_response("Set a cookie")

    # response.delete_cookie('user_name')

    if not request.cookies.get('user_name'):
        response.set_cookie('user_name', str(uuid.uuid4()), max_age=60 * 60 * 24 * 365 * 2)



    return response




if __name__ == '__main__':
    app.run()
