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
import java.io.IOException;
import java.util.*;


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
        response.setContentType("application/javascript");
        response.setCharacterEncoding("UTF-8");
        String query = request.getQueryString();
        String res = "false";
        String listname = "";
        JSONWriter jw = JSONFactory.instance().makeWriter(response.getWriter());
        Map<String, Object> songObj = new TreeMap<>();
        jw.startObject();
        jw.objectValue("result", res);
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
                            String[] t = getSongInfo(s);
                            songObj.put("name", t[0]);
                            songObj.put("durl",t[1]);
                            jw.writeObject(songObj);
                        }
                        break;
                }
            }catch (Exception e){
                e.printStackTrace();
                songObj.put("nodata", "null");
            }
        }

        jw.endArray();
        jw.objectValue("listname", listname);
        jw.endObject();
        jw.flush();
        jw.close();
    }

    private String[] getSongInfo(String songId){
        String[] result = new String[2];
        MusicUtils mu = new MusicUtils(songId);
        Map music = mu.getBestMusic().object();
        String artistName = mu.getArtist();
        String songName = mu.getSongName();
        String bestMusicId = music.get("dfsId").toString();

        String fileName = artistName + " - " + songName  + "." + music.get("extension");
        String durl = au.getDownloadUrl(bestMusicId);

        result[0] = fileName;
        result[1] = durl;
        return result;
    }
}
