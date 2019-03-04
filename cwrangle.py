# This is a doc to clean and append the data I'll be using

import pandas as pd
import re

usa2017 = {'pais': 'country', 'year':'year', 'deported':'deported','sexo':'sex', 'edad':'age', 'p2':'read_write', 'p6':'head_house', \
'p11_1d':'home_dept', 'p14_1':'mex_port', 'p15':'trans_crossm', \
'p17_1c':'coyote_usd', 'p19_1l':'first_city', \
'p19_2l':'second_city', 'p20l':'long_city', 'p26':'us_entry', \
'p30':'trans_crossu', 'p31':'reason', 'p33':'fellow_trav'}

usa2016 = {'pais': 'country', 'year':'year', 'deported':'deported','sexo':'sex', 'edad':'age', 'p2':'read_write', 'p6':'head_house', \
'p11_1d':'home_dept', 'p14_1':'mex_port', 'p15':'trans_crossm', \
'p17_1c':'coyote_usd', 'p19l1':'first_city', \
'p19l2':'second_city', 'p20l':'long_city', 'p26':'us_entry', \
'p30':'trans_crossu', 'p31':'reason', 'p33':'fellow_trav'}

usa2015 = {'pais': 'country', 'year':'year', 'deported':'deported','sexo': 'sex', 'edad':'age', 'p1':'read_write', 'p6':'head_house', \
'p11_1d':'home_dept', 'p14_1':'mex_port', 'p15':'trans_crossm', \
'p17_1c':'coyote_usd', 'p19l1':'first_city',\
'p19l2': 'second_city', 'p20l':'long_city', 'p26':'us_entry', \
'p30':'trans_crossu', 'p31':'reason', 'p33':'fellow_trav'}

usa2014 = {'pais': 'country', 'year':'year', 'deported':'deported','SEXO': 'sex', 'EDAD':'age', 'p1':'read_write', 'p6':'head_house', \
'p11_1d':'home_dept', 'p14_1':'mex_port', 'p15':'trans_crossm', \
'p17_1c':'coyote_usd', 'p19c1':'first_city',\
'p19c2': 'second_city', 'p20c':'long_city', 'p25':'us_entry',\
'p28_1':'trans_crossu', 'p29':'reason', 'p31':'fellow_trav'}

mex2017 = {'pais': 'country', 'year':'year', 'deported':'deported','p1':'sex', 'p2':'age', 'p4':'read_write', 'p8':'head_house', \
'p11_1d':'home_dept', 'p15':'mex_port','p19':'trans_crossm',\
'p20_1c':'coyote_usd','p22_1l':'first_city',\
'p22_2l':'second_city','p24l':'long_city',\
'p18_1':'fellow_travs', 'p34e':'state_deported','p34m':'city_deported'}

mex2016 = {'pais': 'country', 'year':'year', 'deported':'deported','p1':'sex', 'p2':'age', 'p4':'read_write', 'p8':'head_house', \
'p11_1d':'home_dept','p15':'mex_port','p19':'trans_crossm',\
'p20_1c':'coyote_usd','p22_1l':'first_city',\
'p22_2l':'second_city','p24l':'long_city',\
'p18_1':'fellow_travs', 'p34e':'state_deported','p34m':'city_deported'}

mex2015 = {'pais': 'country', 'year':'year', 'deported':'deported','p1':'sex', 'p2':'age', 'p3':'read_write', 'p8':'head_house', \
'p11_1d':'home_dept','p15':'mex_port','p19':'trans_crossm',\
'p20_1c':'coyote_usd','p22_1l':'first_city',\
'p22_2l':'second_city','p24l':'long_city',\
'p18_1':'fellow_travs', 'p34e':'state_deported','p34m':'city_deported'}

mex2014 = {'pais': 'country', 'year':'year', 'deported':'deported', 'p1':'sex', 'p2':'age', 'p3':'read_write', 'p8':'head_house', \
'p11_1d':'home_dept','p14':'mex_port','p18':'trans_crossm',\
'p19_1c':'coyote_usd','p21c1':'first_city',\
'p21c2':'second_city','p23c':'long_city',\
'p17_1':'fellow_travs', 'p43e':'state_deported','p43m':'city_deported'}

to_regex_mex = ['first_city', 'second_city', 'long_city']
to_regex_usa = ['first_city', 'second_city', 'long_city', 'us_entry']

fronteras_guate = {'Tecún Umán': 'Ciudad Hidalgo, Chiapas', \
'El Carmen': 'Talismán, Chiapas', 'Toquián Grande': 'Unión Juárez, Chiapas', \
'La Mesilla':'Cuauhtémoc, Chiapas', 'Gracias a Dios':'Carmen Xhán, Chiapas', \
'Ingenieros': 'Nuevo Orizaba, Chiapas', 'Bethel':'Frontera Corozal, Chiapas', \
'El Ceibo':'El Ceibo, Tabasco', 'Naranjo': 'El Martillo, Tabasco', \
'La Técnica':'Frontera Corozal, Chiapas'}

fronteras_geoguate = {"Ciudad Hidalgo, Chiapas":[14.679726,-92.150326], \
"Carmen Xhán, Chiapas":[16.043086,-91.755012], \
"Frontera Corozal, Chiapas": [16.814734,-90.884703],\
"El Martillo, Tabasco":[17.278333, -91.021111],\
"El Ceibo, Tabasco": [17.261546,-90.994378],\
"Talismán, Chiapas":[14.962768,-92.148176],\
"Unión Juárez, Chiapas": [15.071193,-92.091311],\
"Nuevo Orizaba, Chiapas": [16.082816,-90.63267],\
"Cuauhtémoc, Chiapas":[15.665483,-92.003579]}

fronteras_geomex = {"Reynosa , Tamaulipas":[25.836636,-98.370859],\
"Altar , Sonora": [31.093813,-111.889791],\
"Nuevo Laredo , Tamaulipas":[27.41546,-99.541843],\
"Juárez , Chihuahua": [31.452227,-106.449726],\
"Heroica Matamoros , Tamaulipas":[25.554056,-97.491149],\
"Piedras Negras , Coahuila de Zaragoza": [28.70196,-100.521922],\
"Miguel Alemán , Brecha 124 entre Kilómetro 15 y 16 Norte , Tamaulipas":[26.03106,-98.289915],\
"Tijuana , Baja California":[32.500863,-116.964166],\
"Sonoyta , Sonora":[31.863444,-112.849739],\
"Mexicali , Baja California":[32.62007,-115.44407],\
"Heroica Nogales , Sonora":[31.319239,-110.951443],\
"Otras Ciudades de Sonora":[29.089415,-110.961238],\
"Manuel Ojinaga , Chihuahua":[28.631811,-106.079105],\
"San Luis Río Colorado , Sonora":[32.206599,-115.005363],\
"Ciudad Camargo , Tamaulipas":[26.32583, -98.84583],\
"Puerto Palomas de Villa , Chihuahua":[31.77111, -107.63556],\
"Heroica Ciudad de Cananea , Sonora":[30.982699,-110.210119],\
"Agua Prieta , Sonora":[31.3277755, -109.5489617],\
"Sásabe , Sonora":[30.62328,-110.976749],\
"Tecate , Baja California":[32.435934,-116.273657],\
"Naco , Sonora":[31.18612,-109.885243],\
"Ciudad Acuña , Coahuila de Zaragoza":[29.318204,-100.935878],\
"Río Bravo , Tamaulipas":[25.983256,-98.107506],\
"Otras Ciudades de Tamaulipas":[23.761765,-99.170259],\
"Hidalgo del Parral , Chihuahua":[26.928161,-105.659646],\
"Ciudad Gustavo Díaz Ordaz , Tamaulipas":[26.232, -98.677],\
"Vicente Guerrero , Algodones , Baja California":[30.725833, -115.988889],
"Otras Ciudades de Chihuahua":[28.938764,-106.384451]}

def go(path_data, path_codebook, index, country, year):
    '''
    This function takes in the paths for a dataframe and the codebook
    that accompanies it, index variable, country, and year, and
    returns them as pandas dataframes with appropriate codes.
    '''

    l = []

    if country == 'USA':
        if year == 2017:
            for k in usa2017:
                l.append(k)
                dicr = usa2017
        elif year == 2016:
            for k in usa2016:
                l.append(k)
                dicr = usa2016
        elif year == 2015:
            for k in usa2015:
                l.append(k)
                dicr = usa2015
        else:
            for k in usa2014:
                l.append(k)
                dicr = usa2014

    else:
        if year == 2017:
            for k in mex2017:
                l.append(k)
                dicr = mex2017
        elif year == 2016:
            for k in mex2016:
                l.append(k)
                dicr = mex2016
        elif year == 2015:
            for k in mex2015:
                l.append(k)
                dicr = mex2015
        else:
            for k in mex2014:
                l.append(k)
                dicr = mex2014

    df = read_csv(path_data, path_codebook, index, l)
    renamed = df.rename(columns=dicr)

    mex_borders = renamed.replace({"mex_port": fronteras_guate})

    if country == 'USA':
        regexed = regex(mex_borders, to_regex_usa)
    else:
        regexed = regex(mex_borders, to_regex_mex)
        regexed["deported_place"] = regexed["city_deported"].map(str) + ', ' + regexed["state_deported"]
        regexed.drop(columns=['city_deported', 'state_deported'], inplace=True)

    fronteras = mapfronteras(regexed, fronteras_geoguate, fronteras_geomex, country)

    return fronteras


def mapfronteras(df, fgua, fmex, country):
    '''
    This does the geomapping for the US and Mex border cities
    '''

    if country == 'USA':
        df['mex_port_lat'] = df['mex_port'].map(lambda x: fgua[x][0])
        df['mex_port_long'] = df['mex_port'].map(lambda x: fgua[x][1])

        df['us_entry_lat'] = df['us_entrynew'].map(lambda x: fmex[x][0])
        df['us_entry_long'] = df['us_entrynew'].map(lambda x: fmex[x][1])

    else:
        df['mex_port_lat'] = df['mex_port'].map(lambda x: fgua[x][0])
        df['mex_port_long'] = df['mex_port'].map(lambda x: fgua[x][1])

    return df


def regex(df, regex):
    '''
    This is a helper function to create city, state pairs within
    a column to make it easier to geocode
    '''

    for col in regex:
        new_col = []
        for val in df[col]:
            if type(val) is str:
                val = re.sub('\(', ', ', val)
                val = re.sub('\)', '', val)
            else:
                val = 'No sabe'
            new_col.append(val)

        df[col + 'new'] = new_col
        df.drop(columns = col, inplace=True)

    return df


def read_csv(path_data, codebook, index, cols):
    '''
    Helper function to do all the work.
    '''

    data = pd.read_csv(path_data, usecols=cols)
    codes = pd.read_csv(codebook, encoding = 'latin1')
    codes = codes.loc[codes[index].isin(cols)]

    codedict = dict(codes.set_index(index).groupby(level = 0).apply(lambda x : x.to_dict(orient= 'records')))

    dicts = {}
    for k, v in codedict.items():
        keys = []
        values = []
        for dic in v:
            for j in dic.values():
                if type(j) is int:
                    keys.append(j)
                else:
                    values.append(j)
                d = dict(zip(keys, values))
            dicts[k] = d

    for k, v in dicts.items():
        for col in data:
            if col == k:
                data[col] = data[col].map(v).fillna(data[col])
    return data
