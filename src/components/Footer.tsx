export default function Footer() {
    return (
        <footer className="bg-secondary-900 py-4 mt-8">
            <div className="container mx-auto px-4 text-center text-secondary-400 text-sm">
                <p>Encrypted ERC Token Demo Application</p>
                <p className="text-xs mt-1">
                    <a
                        href="https://avacloud.gitbook.io/encrypted-erc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300"
                    >
                        Documentation
                    </a>
                </p>
            </div>
        </footer>
    )
}