package com.fireaway.h.main;

import com.fireawayh.cloudmusic.utils.ApiUtils;
import com.fireawayh.cloudmusic.utils.JsonUtils;
import com.fireawayh.cloudmusic.utils.MusicUtils;
import com.oracle.javafx.jmx.json.JSONFactory;
import com.oracle.javafx.jmx.json.JSONWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;


/**
 * By FireAwayH on 14/03/2016.
 */
public class MainServlet extends HttpServlet {
    private ApiUtils au = new ApiUtils();
    private JsonUtils ju = new JsonUtils();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String query = request.getQueryString();
        String res = "false";
        String listname = "";

        JSONWriter jw = JSONFactory.instance().makeWriter(response.getWriter());
        Map<String, Object> songObj = new TreeMap<>();
        jw.startObject();
        jw.startArray("songs");

        if(query != null) {
            try {
                String[] q = query.split("=");
                String type = q[0];
                String val = q[1];
                res = "true";
                switch (type){
                    case "id":
                        String[] info = getSongInfo(val);
                        songObj.put("name", info[0]);
                        songObj.put("durl",info[1]);
                        jw.writeObject(songObj);
                        break;
                    case "playlist":
                        ArrayList<String> playList = ju.getPlayListSongs(val);
                        int len = playList.size();
                        listname = playList.get(len - 1);
                        playList.remove(len - 1);
                        for (String s : playList){
                            try {
                                String[] t = getSongInfo(s);
                                songObj.put("name", t[0]);
                                songObj.put("durl", t[1]);
                                jw.writeObject(songObj);
                            }catch (NullPointerException ee){
                                ee.printStackTrace();
                                songObj.put("name", "Song ID: " + s + " Failed");
                                songObj.put("durl", "#");
                                jw.writeObject(songObj);
                            }
                        }
                        break;
                    case "playlistExtra":
                        List<Map<String, Object>> playListJson = ju.getPlayListBestMusic(val);
                        int JsonLen = playListJson.size();
                        listname = playListJson.get(JsonLen - 1).get("listname").toString();
                        playListJson.remove(JsonLen - 1);
                        for (Map<String, Object> j : playListJson){
                            String s = j.get("id").toString();
                            String n = j.get("name").toString();
                            String e = j.get("extension").toString();
                            String b = j.get("dfsId").toString();
                            String d = au.getDownloadUrl(b, e);
                            try{
                                songObj.put("name", n + "." + e);
                                songObj.put("durl", d);
                                jw.writeObject(songObj);
                            }catch (Exception eee){
                                eee.printStackTrace();
                                songObj.put("name", "Song ID: " + s + " Failed");
                                songObj.put("durl", "#");
                                jw.writeObject(songObj);
                            }
                        }
                        break;
                }
            }catch (Exception e){
                res = e.getMessage();
                e.printStackTrace();
                songObj.put("nodata", "null");
            }
        }

        // Set JAVA_OPTS="$JAVA_OPTS -Dfile.encoding=UTF8 -Dsun.jnu.encoding=UTF8" in catalina.sh line 249
        jw.endArray();
        jw.objectValue("listname", listname);
        jw.objectValue("result", res);
//        jw.objectValue("Default Charset=", Charset.defaultCharset());
//        jw.objectValue("file.encoding=", System.getProperty("file.encoding"));
//        jw.objectValue("Default Charset=", Charset.defaultCharset());
//        jw.objectValue("Default Charset in Use=", getDefaultCharSet());
        jw.endObject();
        jw.flush();
        jw.close();



    }

    private static String getDefaultCharSet() {
        OutputStreamWriter writer = new OutputStreamWriter(new ByteArrayOutputStream());
        String enc = writer.getEncoding();
        return enc;
    }

    private String[] getSongInfo(String songId) throws Exception{
        String[] result = new String[2];
        MusicUtils mu = new MusicUtils(songId);
        Map music = mu.getBestMusic().object();
        String artistName = mu.getArtist();
        String songName = mu.getSongName();
        String bestMusicId = music.get("dfsId").toString();
        String ext = music.get("extension").toString();

        String fileName = artistName + " - " + songName  + "." + ext;

        String durl = au.getDownloadUrl(bestMusicId, ext);

        result[0] = fileName;
        result[1] = durl;
        return result;
    }
}
