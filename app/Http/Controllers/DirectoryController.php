<?php

namespace App\Http\Controllers;

class DirectoryController extends Controller
{
    /**
     * Display the business directory page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return redirect()->route('vi.cong-ty-tu-van');
    }
}
