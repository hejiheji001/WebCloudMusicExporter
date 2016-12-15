package com.fireaway.h.main;

import com.fireawayh.cloudmusic.utils.ApiUtils;
import com.fireawayh.cloudmusic.utils.JsonUtils;
import com.fireawayh.cloudmusic.utils.MusicUtils;
import com.fireawayh.main.YunOffline;
import com.oracle.javafx.jmx.json.JSONFactory;
import com.oracle.javafx.jmx.json.JSONWriter;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.cookie.BasicClientCookie;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;

/**
 * By FireAwayH on 14/03/2016.
 */
public class MainServlet extends HttpServlet {
    private ApiUtils au = new ApiUtils();
    private JsonUtils ju = new JsonUtils();

    private Cookie[] parseCookie(String cookieString){
        String[] keyValue = cookieString.split(";");
        Cookie[] cookies = new BasicClientCookie[keyValue.length];
        int i = 0;
        for (String s : keyValue){
            String[] t = s.split("=");
            String key = t[0];
            String value = t[1];
            cookies[i] = new BasicClientCookie(key, value);
            i++;
        }
        return cookies;
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String path = request.getRequestURI();
        switch (path){
            case "/save":
                String c = request.getParameter("cookie");
                String t = request.getParameter("token");
                String p = request.getParameter("save_path");
                String s = request.getParameter("source_url");
                BasicCookieStore cookieStore = new BasicCookieStore();
                Cookie[] cookies = parseCookie(c);
                cookieStore.addCookies(cookies);

                YunOffline y = new YunOffline(t, s, "", "");
                y.setSavepath(p);
                y.setCookieStore(cookieStore);
                y.saveToYunPan("", "");
                break;
        }
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

                if(type.equals("song")){
                    String[] info = getSongInfo(val);
                    songObj.put("artist",info[2]);
                    songObj.put("name", info[0]);
                    songObj.put("durl",info[1]);
                    jw.writeObject(songObj);
                }else {
                    List<Map<String, Object>> songsJSON = null;
                    switch (type){
                        case "playlist":
                            songsJSON = ju.getPlayListBestMusic(val);
                            break;
                        case "album":
                            songsJSON = ju.getAlbumBestMusic(val);
                            break;
                        case "artist":
                            songsJSON = ju.getArtistBestMusic(val);
                            break;
                    }
                    int listLen = songsJSON.size();
                    listname = songsJSON.get(listLen - 1).get("listname").toString();
                    songsJSON.remove(listLen - 1);
                    for (Map<String, Object> j : songsJSON){
                        String s = j.get("id").toString();
                        String a = j.get("artist").toString();
                        String n = j.get("name").toString();
                        String e = j.get("extension").toString();
                        String b = j.get("dfsId").toString();
                        String d = au.getDownloadUrl(b, e);
                        try{
                            songObj.put("artist", a);
                            songObj.put("name", n + "." + e);
                            songObj.put("durl", d);
                            jw.writeObject(songObj);
                        }catch (Exception eee){
                            eee.printStackTrace();
                            songObj.put("name", "Playlist ID: " + s + " Failed");
                            songObj.put("durl", "#");
                            jw.writeObject(songObj);
                        }
                    }
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
        String[] result = new String[3];
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
        result[2] = artistName;
        return result;
    }

    public static void main(String[] args) {
        ApiUtils au = new ApiUtils();
        JsonUtils ju = new JsonUtils();
        Map<String, Object> songObj = new TreeMap<>();
        List<Map<String, Object>> songsJSON = ju.getArtistBestMusic("44266");
        int listLen = songsJSON.size();
        String listname = songsJSON.get(listLen - 1).get("listname").toString();
        songsJSON.remove(listLen - 1);
        for (Map<String, Object> j : songsJSON){
            String s = j.get("id").toString();
            String a = j.get("artist").toString();
            String n = j.get("name").toString();
            String e = j.get("extension").toString();
            String b = j.get("dfsId").toString();
            String d = au.getDownloadUrl(b, e);
            try{
                songObj.put("artist", a);
                songObj.put("name", n + "." + e);
                songObj.put("durl", d);
            }catch (Exception eee){
                eee.printStackTrace();
                songObj.put("name", "Playlist ID: " + s + " Failed");
                songObj.put("durl", "#");
            }
        }
    }
}
